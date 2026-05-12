using EduCollabAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCollabAPI.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<StudyGroup> StudyGroups { get; set; }
        public DbSet<Material> Materials { get; set; }
        public DbSet<Meeting> Meetings { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
        public DbSet<Discussion> GroupMessages { get; set; }  
        public DbSet<CreatorRequest> CreatorRequests { get; set; }
        public DbSet<GroupRequest> GroupRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Discussion>()
                .HasOne(m => m.StudyGroup)
                .WithMany()
                .HasForeignKey(m => m.StudyGroupId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Discussion>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
