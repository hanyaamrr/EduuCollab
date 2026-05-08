using System.ComponentModel.DataAnnotations;

namespace EduCollabAPI.DTOs
{
    public class StudyGroupCreateDTO
    {
        [Required]
        public int CreatorId { get; set; }

        [Required]
        public string Subject { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        [Required]
        [Range(2, 100)]
        public int MaxMembers { get; set; }

        [Required]
        public string MeetingType { get; set; }

        [Required]
        public string MeetingSchedule { get; set; }

        [Required]
        public string Location { get; set; }
    }
}