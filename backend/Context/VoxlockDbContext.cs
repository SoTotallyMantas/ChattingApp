using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Options;

namespace backend.Context

{
    public class VoxlockDbContext(DbContextOptions<VoxlockDbContext> options) : DbContext(options)
    {
        public DbSet<Users> Users => Set<Users>();
        public DbSet<UserSettings> UserSettings => Set<UserSettings>();
        public DbSet<Servers> Servers => Set<Servers>();
        public DbSet<ServerMembers> ServerMembers => Set<ServerMembers>();
        public DbSet<ServerUserRoles> ServerUserRoles => Set<ServerUserRoles>();
        public DbSet<Channels> Channels => Set<Channels>();
        public DbSet<VoiceChannels> VoiceChannels => Set<VoiceChannels>();
        public DbSet<ServerRoles> ServerRoles => Set<ServerRoles>();
        public DbSet<MessageAttachments> Attachments => Set<MessageAttachments>();
        public DbSet<Messages> Messages => Set<Messages>();
        public DbSet<ServerRolePermissions> ServerRolePermissions => Set<ServerRolePermissions>();
        public DbSet<Permissions> Permissions => Set<Permissions>();
        public DbSet<VoiceStates> VoiceStates => Set<VoiceStates>();
        public DbSet<ServerInvites> ServerInvites => Set<ServerInvites>();
        public DbSet<ServerBans> ServerBans => Set<ServerBans>();
        public DbSet<RegistrationWhitelist> RegistrationWhitelist => Set<RegistrationWhitelist>();
        public DbSet<UserTokens> RefreshTokens => Set<UserTokens>();
        public DbSet<ChannelEncryptionKey> ChannelEncryptionKeys => Set<ChannelEncryptionKey>();
        public DbSet<Friendships> Friendships => Set<Friendships>();
        public DbSet<MessageEmbedding> MessageEmbeddings => Set<MessageEmbedding>();

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                var connectionString =
                    $"Host={Environment.GetEnvironmentVariable("DB_HOST")};" +
                    $"Port={Environment.GetEnvironmentVariable("DB_PORT")};" +
                    $"Database={Environment.GetEnvironmentVariable("DB_NAME")};" +
                    $"Username={Environment.GetEnvironmentVariable("DB_USER")};" +
                    $"Password={Environment.GetEnvironmentVariable("DB_PASS")};";

                optionsBuilder.UseNpgsql(connectionString, o => o.UseVector());
            }
        }
      

        protected override void OnModelCreating(ModelBuilder model)
        {
            base.OnModelCreating(model);
            model.HasPostgresExtension("vector");
            
            model.Entity<MessageEmbedding>()
                .HasKey(s => s.EmbeddingGuid);
            model.Entity<MessageEmbedding>()
                .HasOne<Messages>()               
                .WithMany()                        
                .HasForeignKey(e => e.MessageGuid)
                .OnDelete(DeleteBehavior.Cascade);

            model.Entity<MessageEmbedding>()
                .HasIndex(e => e.Embedding)
                .HasMethod("ivfflat")
                .HasOperators("vector_cosine_ops");

            model.Entity<ChannelEncryptionKey>()
                .HasKey(x => x.ChannelEncryptionKeyGUID);
            model.Entity<ChannelEncryptionKey>()
                .HasIndex(x => x.ChannelGuid)
                .IsUnique();

            model.Entity<ChannelEncryptionKey>()
                .HasOne(x => x.Channel)
                .WithOne(c => c.EncryptionKey)
                .HasForeignKey<ChannelEncryptionKey>(x => x.ChannelGuid)
                .OnDelete(DeleteBehavior.Cascade);

            // Users <-> UserSettings 1:1 
            model.Entity<UserSettings>()
                .HasKey(s => s.UserSettingsGuid);

            model.Entity<UserSettings>()
                .Property(s => s.UserGuid)
                .IsRequired();

            model.Entity<UserSettings>()
                .HasOne(s => s.User)
                .WithOne(u => u.Settings)
                .HasForeignKey<Users>(u => u.UserGuid)
                .OnDelete(DeleteBehavior.Cascade);

            model.Entity<UserSettings>()
                .HasIndex(s => s.UserGuid)
                .IsUnique();


            model.Entity<Users>()
                .HasKey(u => u.UserGuid);

            model.Entity<Users>()
                .HasOne(u => u.Settings)
                .WithOne(s => s.User)
                .HasForeignKey<UserSettings>(s => s.UserGuid)
                .OnDelete(DeleteBehavior.Cascade);

            // Users <-> OwnedServers 1:M

            model.Entity<Servers>()
                .HasKey(s => s.ServerGuid);

            model.Entity<Servers>()
                .HasOne(s => s.Owner)
                .WithMany(u => u.OwnedServers)
                .HasForeignKey(s => s.OwnerGuid)
                .OnDelete(DeleteBehavior.Restrict);

            // ServerMembers Composite Key
            model.Entity<ServerMembers>()
                .HasKey(sm => new { sm.ServerGuid, sm.UserGuid });

            model.Entity<ServerMembers>()
                .HasOne(sm => sm.server)
                .WithMany(s => s.Members)
                .HasForeignKey(sm => sm.ServerGuid);

            model.Entity<ServerMembers>()
                .HasOne(sm => sm.User)
                .WithMany(u => u.ServerMembers)
                .HasForeignKey(sm => sm.UserGuid);

            // Channels -> Parent 
            model.Entity<Channels>()
                .HasKey(c => c.ChannelGuid);

            model.Entity<Channels>()
                .Property(c => c.ParentGuid)
                .IsRequired(false);

            model.Entity<Channels>()
                .HasOne(c => c.Servers)
                .WithMany(s => s.Channels)
                .HasForeignKey(c => c.ServerGuid);

            model.Entity<Channels>()
                .HasOne(c => c.Parent)
                .WithMany(c => c.Children)
                .HasForeignKey(c => c.ParentGuid)
                .OnDelete(DeleteBehavior.Restrict);

            // VoiceChannels 
            model.Entity<VoiceChannels>()
                .HasKey(vc => vc.ChannelGuid);

            model.Entity<VoiceChannels>()
                .HasOne(vc => vc.Channel)
                .WithOne(c => c.VoiceChannels)
                .HasForeignKey<VoiceChannels>(vc => vc.ChannelGuid)
                .OnDelete(DeleteBehavior.Cascade);

            // Messages 
            model.Entity<Messages>()
                .HasKey(m => m.MessageGuid);

            model.Entity<Messages>()
                .HasOne(m => m.Channel)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ChannelGuid)
                .OnDelete(DeleteBehavior.Cascade);

            model.Entity<Messages>()
                .HasOne(m => m.User)
                .WithMany(u => u.Messages)
                .HasForeignKey(m => m.UserGuid)
                .OnDelete(DeleteBehavior.Restrict);

            model.Entity<Messages>()
                .HasOne(m => m.ReplyTo)
                .WithMany()
                .HasForeignKey(m => m.ReplyToGuid)
                .OnDelete(DeleteBehavior.Restrict);

            // MessageAttachments
            model.Entity<MessageAttachments>()
                .HasKey(a => a.AttachementGuid);

            model.Entity<MessageAttachments>()
                .HasOne(ma => ma.Messages)
                .WithMany(m => m.MessageAttachments)
                .HasForeignKey(ma => ma.MessageGuid)
                .OnDelete(DeleteBehavior.Cascade);

            // Roles 
            model.Entity<ServerRoles>()
                .HasKey(r => r.RoleGuid);

            model.Entity<ServerRoles>()
                .HasOne(r => r.Server)
                .WithMany(s => s.Roles)
                .HasForeignKey(r => r.ServerGuid);

            // RolePermissions Composite Key
            model.Entity<ServerRolePermissions>()
                .HasKey(rp => new { rp.RoleGuid, rp.PermissionsGuid });
            
            model.Entity<ServerRolePermissions>()
                .HasOne(rp => rp.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.RoleGuid);

            model.Entity<ServerRolePermissions>()
                .HasOne(rp => rp.Permission)
                .WithMany()
                .HasForeignKey(rp => rp.PermissionsGuid);
            // Permissions
            model.Entity<Permissions>()
                .HasKey(p => p.PermissionGuid);
            // Server Invites 
            model.Entity<ServerInvites>()
                .HasKey(i => i.InviteGuid);

            model.Entity<ServerInvites>()
                .HasOne(i => i.Server)
                .WithMany()
                .HasForeignKey(i => i.ServerGuid);

            model.Entity<ServerInvites>()
                .HasOne(i => i.Creator)
                .WithMany()
                .HasForeignKey(i => i.CreatedByGuid);
            // Server Bans 
            model.Entity<ServerBans>()
                .HasKey(b => b.BanGuid);

            model.Entity<ServerBans>()
                .HasOne(b => b.Server)
                .WithMany()
                .HasForeignKey(b => b.ServerGuid);

            model.Entity<ServerBans>()
                .HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.UserGuid);
            model.Entity<ServerBans>()
                .HasOne(b => b.BannedByUser)
                .WithMany()
                .HasForeignKey(b => b.BannedByGuid)
                .OnDelete(DeleteBehavior.Restrict);

            // ServerUserRoles Composite Key
            model.Entity<ServerUserRoles>()
                .HasKey(sur => new { sur.ServerGuid, sur.UserGuid, sur.RoleGuid });

            model.Entity<ServerUserRoles>()
                .HasOne(sur => sur.Server)
                .WithMany()
                .HasForeignKey(sur => sur.ServerGuid);

            model.Entity<ServerUserRoles>()
                .HasOne(sur => sur.User)
                .WithMany(u => u.ServerUserRoles)
                .HasForeignKey(sur => sur.UserGuid);

            model.Entity<ServerUserRoles>()
                .HasOne(sur => sur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(sur => sur.RoleGuid);

            // VoiceStates 
            model.Entity<VoiceStates>()
                .HasKey(vs => vs.VoiceStateGuid);

            model.Entity<VoiceStates>()
                .HasOne(vs => vs.User)
                .WithMany()
                .HasForeignKey(vs => vs.UserGuid)
                .OnDelete(DeleteBehavior.Cascade);

            model.Entity<VoiceStates>()
                .HasOne(vs => vs.Channel)
                .WithMany()
                .HasForeignKey(vs => vs.ChannelGuid);

            // RegistrationWhitelist 
            model.Entity<RegistrationWhitelist>()
                .HasKey(w => w.WhitelistGuid);

            model.Entity<RegistrationWhitelist>()
                .HasOne( w => w.AddedByUser)
                .WithMany()
                .HasForeignKey(w => w.AddedBy)
                .OnDelete(DeleteBehavior.Restrict);
            // Refresh Tokens
            model.Entity<UserTokens>()
                .HasKey(rt => rt.TokenGuid);

            model.Entity<UserTokens>()
                .HasOne(rt => rt.User)
                .WithMany()
                .HasForeignKey(rt => rt.UserGuid)
                .OnDelete(DeleteBehavior.Cascade);

            model.Entity<Friendships>()
                .HasKey(f => f.FriendshipGuid);

            model.Entity<Friendships>()
                .HasIndex(f => new { f.RequesterGuid, f.AddresseeGuid })
                .IsUnique();

            model.Entity<Friendships>()
                .HasOne(f => f.Requester)
                .WithMany(u => u.SentFriendships)
                .HasForeignKey(f => f.RequesterGuid)
                .OnDelete(DeleteBehavior.Cascade);

            model.Entity<Friendships>()
                .HasOne(f => f.Addressee)
                .WithMany(u => u.ReceivedFriendships)
                .HasForeignKey(f => f.AddresseeGuid)
                .OnDelete(DeleteBehavior.Cascade);



        }


    }
}
