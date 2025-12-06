using backend.Context;
using backend.DTO.MessageDtos;
using backend.Helper;
using backend.Hubs;
using backend.Interfaces;
using backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata.Ecma335;

namespace backend.Services
{
    public class MessageService(VoxlockDbContext db, IHubContext<ChatHub> hubContext, IUserContext user, IUserService userService) : IMessageService
    {
        private readonly VoxlockDbContext _db = db;
        private readonly IHubContext<ChatHub> _hubContext = hubContext;
        private readonly IUserContext _user = user;
        private readonly IUserService _userService = userService;

        private static MessageResponseDto MapToResponse(Messages message)
        {
            return new MessageResponseDto
            {
                MessageGuid = message.MessageGuid,
                ChannelGuid = message.ChannelGuid,

                UserGuid = message.UserGuid,
                UserName = message.User?.UserName ?? "",
                DisplayName = message.User?.DisplayName ?? "",
                AvatarUrl = message.User?.AvatarURL ?? "",

                Content = message.Content,
                CreatedAt = message.CreatedAt,
                EditedAt = message.EditedAt,
                ReplyToGuid = message.ReplyToGuid ?? null,
                Attachments = new()
            };
        }
        public async Task<MessageResponseDto> SendMessageAsync(SendMessageRequestDto dto, Guid userGuid)
        {


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
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow,
                ReplyToGuid = dto.ReplyToGuid ?? null

            };
            _db.Messages.Add(message);
            await _db.SaveChangesAsync();

            var fullMessage = await _db.Messages
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.MessageGuid == message.MessageGuid);

            var response = MapToResponse(fullMessage!);
            // Server Notification

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
                if (!await _userService.HasChannelPermission(userGuid, message.ChannelGuid, AppPermissions.EDIT_MESSAGES))
                {
                    throw new Exception("User does not have permission to edit this message.");
                }
            }

            message.Content = dto.NewContent;
            message.EditedAt = DateTime.UtcNow;
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
            // Notify channel about the deleted message
            await _hubContext.Clients.Group($"channel-{message.ChannelGuid}")
            .SendAsync("MessageDeleted", new
            {
                MessageGuid = messageGuid,
                ChannelGuid = message.ChannelGuid
            });
            return true;
        }

    }
}