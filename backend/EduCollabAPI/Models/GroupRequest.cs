using System.ComponentModel.DataAnnotations;

namespace EduCollabAPI.Models
{
    public class GroupRequest
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Subject { get; set; }
        public string Location { get; set; }
        public int MaxMembers { get; set; }
        public string MeetingType { get; set; }
        public string MeetingSchedule { get; set; }
        public int CreatorId { get; set; } // The ID of the GroupCreator who requested it
        public DateTime RequestedAt { get; set; } = DateTime.Now;
    }
}