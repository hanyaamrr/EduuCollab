using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCollabAPI.Models
{
    public class StudyGroup
    {
        [Key]
        public int Id { get; set; }
        public string CreatorName { get; set; }
        public string Name { get; set; } 
        public string Description { get; set; } 
        public string Subject { get; set; } 
        public string Location { get; set; }
        public int MaxMembers { get; set; }
        public string MeetingType { get; set; }  //online or offline
        public string MeetingSchedule { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("CreatorId")]
        public int CreatorId { get; set; }

        public List<Material> GroupMaterials { get; set; } = new List<Material>();
        public List<GroupMember> Members { get; set; } = new List<GroupMember>();
        //public List<Discussion> Discussions { get; set; } = new List<Discussion>();
    }
}
