using backend.Context;
using backend.DTO.MessageDtos;
using backend.Helper;
using backend.Hubs;
using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Pgvector;
using Pgvector.EntityFrameworkCore;
using System.Reflection.Metadata.Ecma335;
using System.Security.Cryptography;

namespace backend.Services
{
    public class MessageService(VoxlockDbContext db, IHubContext<ChatHub> hubContext, IUserContext user, IUserService userService,IS3StorageService storageService, IEncryptionService encryptionService, IEmbeddingService embeddingService) : IMessageService
    {
        private readonly VoxlockDbContext _db = db;
        private readonly IHubContext<ChatHub> _hubContext = hubContext;
        private readonly IUserContext _user = user;
        private readonly IUserService _userService = userService;
        private readonly IS3StorageService _storageService = storageService;
        private readonly IEncryptionService _encryptionService = encryptionService;
        private readonly IEmbeddingService _embeddingService = embeddingService;

        private MessageResponseDto MapToResponse(Messages message)
        {
            return new MessageResponseDto
            {
                MessageGuid = message.MessageGuid,
                ChannelGuid = message.ChannelGuid,

                UserGuid = message.UserGuid,
                UserName = message.User?.UserName ?? "",
                DisplayName = message.User?.DisplayName ?? "",
                AvatarKey = message.User?.AvatarKey ?? "",
                
                Content = _encryptionService.DecryptMessage(
                        message.ChannelGuid,
                        message.EncryptedContent
                    ) ?? "",
                CreatedAt = message.CreatedAt,
                EditedAt = message.EditedAt,
                ReplyToGuid = message.ReplyToGuid ?? null,
                Attachments = message.MessageAttachments.Select(a => new MessageAttachmentResponseDto
                {
                    AttachmentGuid = a.AttachementGuid,
                    FileName = a.Filename,
                    AttachmentKey = a.AttachementKey,
                    ContentType = a.ContentType,
                    SizeBytes = a.SizeBytes,
                }).ToList(),
            };
        }
        public async Task<MessageResponseDto> SendMessageAsync(SendMessageRequestDto dto, Guid userGuid)
        {
            if (dto.ReplyToGuid.HasValue)
            {
                var replyExists = await _db.Messages.AnyAsync(m =>
                    m.MessageGuid == dto.ReplyToGuid.Value &&
                    m.ChannelGuid == dto.ChannelGuid
                );

                if(!replyExists)
                {
                    throw new InvalidOperationException("Invalid reply");
                }
            }

            if (!await _userService.IsChannelMember(userGuid, dto.ChannelGuid))
            {
                throw new Exception("User is not a member of the channel.");
            }
            if (!await _userService.HasChannelPermission(userGuid, dto.ChannelGuid, AppPermissions.SEND_MESSAGES))
            {
                throw new Exception("User does not have permission to send messages in this channel.");
            }


            var sendMessageInfo = await _db.Channels
                .Where(c => c.ChannelGuid == dto.ChannelGuid)
                .Select(c => new
                {
                    c.ChannelGuid,
                    c.ServerGuid
                })
                .FirstOrDefaultAsync();


            var message = new Messages
            {
                MessageGuid = Guid.NewGuid(),
                ChannelGuid = dto.ChannelGuid,
                UserGuid = userGuid,
                EncryptedContent = _encryptionService.EncryptMessage(dto.ChannelGuid,dto.Content),
                CreatedAt = DateTime.UtcNow,
                ReplyToGuid = dto.ReplyToGuid ?? null

            };
            _db.Messages.Add(message);

            var embeddingVector = new Vector(_embeddingService.Embed(dto.Content ?? string.Empty));
            _db.MessageEmbeddings.Add(new MessageEmbedding
            {
                EmbeddingGuid = Guid.NewGuid(),
                MessageGuid = message.MessageGuid,
                ChannelGuid = dto.ChannelGuid,
                Embedding = embeddingVector
            });

            await _db.SaveChangesAsync();

            var fullMessage = await _db.Messages
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.MessageGuid == message.MessageGuid);

            var response = MapToResponse(fullMessage!);
        
            await _hubContext.Clients.Group($"server-{sendMessageInfo!.ServerGuid}")
                .SendAsync("ServerMessageCreated", new
                {
                    ServerGuid = sendMessageInfo.ServerGuid,
                    ChannelGuid = dto.ChannelGuid,
                    MessageGuid = message.MessageGuid,
                    Preview = dto.Content.Length > 20 ? string.Concat(dto.Content.AsSpan(0, 20), "...") : dto.Content
                });

            // Channel Realtime Message
            await _hubContext.Clients.Group($"channel-{dto.ChannelGuid}")
                .SendAsync("NewMessage", response);

            return response;

        }

        public async Task<MessageResponseDto> EditMessageAsync(EditMessageRequestDto dto, Guid userGuid)
        {

            var message = await _db.Messages
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.MessageGuid == dto.MessageGuid);
            if (message == null)
            {
                throw new Exception("Message not found.");
            }
            if (!await _userService.IsChannelMember(userGuid, message.ChannelGuid))
            {
                throw new Exception("User is not a member of the channel.");
            }
            if (message.UserGuid != userGuid)
            {
                throw new Exception("Only the message author can edit this message.");
            }

            message.EncryptedContent = _encryptionService.EncryptMessage(message.ChannelGuid,dto.NewContent);
            message.EditedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            var embedVector = new Vector(_embeddingService.Embed(dto.NewContent ?? string.Empty));
            var existingEmbed = await _db.MessageEmbeddings.FirstOrDefaultAsync(e => e.MessageGuid == message.MessageGuid);
            if (existingEmbed == null)
            {
                _db.MessageEmbeddings.Add(new MessageEmbedding
                {
                    EmbeddingGuid = Guid.NewGuid(),
                    MessageGuid = message.MessageGuid,
                    ChannelGuid = message.ChannelGuid,
                    Embedding = embedVector
                });
            }
            else
            {
                existingEmbed.Embedding = embedVector;
                _db.MessageEmbeddings.Update(existingEmbed);
            }
            await _db.SaveChangesAsync();

            var response = MapToResponse(message);


            // Notify channel about the edited message
            await _hubContext.Clients.Group($"channel-{message.ChannelGuid}")
                .SendAsync("MessageEdited", response);
            return response;
        }
        public async Task<List<MessageResponseDto>> GetHistoryAsync(Guid channelGuid, DateTime? before, Guid userGuid)
        {
            if (!await _userService.IsChannelMember(userGuid, channelGuid))
                throw new Exception("Not a member");

            var messages = await _db.Messages
                .Where(m => m.ChannelGuid == channelGuid &&
                           (!before.HasValue || m.CreatedAt < before.Value))
                .OrderByDescending(m => m.CreatedAt)
                .Include(m => m.User)
                .Include(m => m.MessageAttachments)
                .AsNoTracking()
                .Take(30)
                .ToListAsync();

            return messages.Select(MapToResponse).ToList();
        }

        public async Task<bool> DeleteMessageAsync(Guid messageGuid, Guid userGuid)
        {

            var message = await _db.Messages
                .FirstOrDefaultAsync(m => m.MessageGuid == messageGuid);
            if (message == null)
            {
                throw new Exception("Message not found.");
            }

            if (!await _userService.IsChannelMember(userGuid, message.ChannelGuid))
            {
                throw new Exception("User is not a member of the channel.");
            }
            if (message.UserGuid != userGuid)
            {
                if (!await _userService.HasChannelPermission(userGuid, message.ChannelGuid, AppPermissions.MANAGE_MESSAGES))
                {
                    throw new Exception("User does not have permission to delete this message.");
                }


            }

            _db.Messages.Remove(message);
            await _db.SaveChangesAsync();
            
            await _hubContext.Clients.Group($"channel-{message.ChannelGuid}")
            .SendAsync("MessageDeleted", new
            {
                MessageGuid = messageGuid,
                ChannelGuid = message.ChannelGuid
            });
            return true;
        }


        public async Task AddAttachmentAsync(Guid messageGuid, Stream fileStream, string fileName, string contentType, long sizeBytes, Guid userguid, CancellationToken ct = default)
        {
            var message = await _db.Messages
                .Include(m => m.Channel)
                .FirstOrDefaultAsync(m => m.MessageGuid == messageGuid, ct);
            if (message == null)
            {
                throw new Exception("Message not found");
            }

            if (!await _userService.IsChannelMember(userguid, message.ChannelGuid))
            {
                throw new UnauthorizedAccessException();
            }

            var attachmentGuid = Guid.NewGuid();

            var storageKey = StorageKeyGenerator.MessageAttachment(message.ChannelGuid, messageGuid, attachmentGuid);

            await using var encryptedStream = new MemoryStream();
            await _encryptionService.EncryptToStreamAsync(message.ChannelGuid, fileStream, encryptedStream, ct);

            await _storageService.UploadAsync(
                   storageKey,
                   encryptedStream,
                   "application/octet-stream",
                   ct
                );

            _db.Attachments.Add(new MessageAttachments
            {
                AttachementGuid = attachmentGuid,
                MessageGuid = messageGuid,
                AttachementKey = storageKey,
                Filename = fileName,
                ContentType = contentType,
                SizeBytes = sizeBytes,
            });

            await _db.SaveChangesAsync();

            var updatedMessage = await _db.Messages
                .Include(m => m.User)
                .Include(m => m.MessageAttachments)
                .FirstOrDefaultAsync(m => m.MessageGuid == messageGuid, ct);

            if (updatedMessage != null)
            {
                var response = MapToResponse(updatedMessage);
                await _hubContext.Clients.Group($"channel-{updatedMessage.ChannelGuid}")
                    .SendAsync("MessageEdited", response);
            }
        }

        public async Task<bool> RemoveAttachmentAsync(Guid messageGuid, Guid attachmentGuid, Guid userGuid, CancellationToken ct = default)
        {
            var attachment = await _db.Attachments
                .Include(a => a.Messages)
                .FirstOrDefaultAsync(a => a.AttachementGuid == attachmentGuid && a.MessageGuid == messageGuid, ct);

            if (attachment == null)
            {
                throw new Exception("Attachment not found.");
            }

            var message = attachment.Messages;
            if (!await _userService.IsChannelMember(userGuid, message.ChannelGuid))
            {
                throw new UnauthorizedAccessException();
            }

            if (message.UserGuid != userGuid)
            {
                throw new Exception("Only the message author can remove attachments.");
            }

            var storageKey = attachment.AttachementKey;
            _db.Attachments.Remove(attachment);
            await _db.SaveChangesAsync(ct);

           
            try
            {
                await _storageService.DeleteAsync(storageKey, ct);
            }
            catch
            {
               
            }

            
            var updatedMessage = await _db.Messages
                .Include(m => m.User)
                .Include(m => m.MessageAttachments)
                .FirstOrDefaultAsync(m => m.MessageGuid == messageGuid, ct);

            if (updatedMessage != null)
            {
                var response = MapToResponse(updatedMessage);
                await _hubContext.Clients.Group($"channel-{updatedMessage.ChannelGuid}")
                    .SendAsync("MessageEdited", response);
            }

            return true;
        }

        public async Task<List<MessageResponseDto>> SearchAsync(Guid channelGuid, string query, Guid userGuid, int limit = 20 )
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return [];
            }

            if (!await _userService.IsChannelMember(userGuid, channelGuid))
                throw new Exception("Not a member");

            limit = Math.Clamp(limit, 1, 50);
            double minScore = 0.78;
            minScore = Math.Clamp(minScore, 0.0, 1.0);
            var maxDistance = 1.0 - minScore;

            var queryVector = new Vector(_embeddingService.Embed(query));

            var hits = await _db.MessageEmbeddings
                .Where(e => e.ChannelGuid == channelGuid)
                .Where(e => e.Embedding.CosineDistance(queryVector) <= maxDistance)
                .OrderBy(e => e.Embedding.CosineDistance(queryVector))
                .Take(limit)
                .Select(e => e.MessageGuid)
                .ToListAsync();

            if (hits.Count == 0) return [];

            var messages = await _db.Messages
                .Include(m => m.User)
                .Include(m => m.MessageAttachments)
                .Where(m => hits.Contains(m.MessageGuid))
                .ToListAsync();

            var map = messages.ToDictionary(m => m.MessageGuid, m => m);

            var ordered = new List<MessageResponseDto>();
            foreach (var id in hits)
            {
                if (map.TryGetValue(id, out var msg))
                {
                    ordered.Add(MapToResponse(msg));
                }
            }

            return ordered;
        }

        public async Task<(Stream Stream, string ContentType, string FileName)> GetAttachmentAsync(Guid attachmentGuid, Guid userGuid, CancellationToken ct = default)
        {
            var attachment = await _db.Attachments
                .Include(a => a.Messages)
                .FirstOrDefaultAsync(a => a.AttachementGuid == attachmentGuid, ct);

            if (attachment == null)
            {
                throw new Exception("Attachment not found.");
            }

            if (!await _userService.IsChannelMember(userGuid, attachment.Messages.ChannelGuid))
            {
                throw new UnauthorizedAccessException();
            }

            var download = await _storageService.DownloadAsync(attachment.AttachementKey, ct);
            if (download == null)
            {
                throw new Exception("Attachment missing from storage.");
            }

            var cipherStream = download.Value.Stream;
            var plainStream = new MemoryStream();
            await _encryptionService.DecryptFromStreamAsync(attachment.Messages.ChannelGuid, cipherStream, plainStream, ct);
            plainStream.Position = 0;

            return (plainStream, attachment.ContentType, attachment.Filename);
        }

    }
}
