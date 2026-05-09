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
    }
}
