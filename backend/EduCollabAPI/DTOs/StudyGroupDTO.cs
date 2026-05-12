using System.ComponentModel.DataAnnotations;

namespace EduCollabAPI.DTOs
{
    public class StudyGroupDTO
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public string Subject { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        [StringLength(50)]
        public string Name { get; set; }

        [Required]
        public string Location { get; set; }

        public string MeetingType { get; set; }      
        public string MeetingSchedule { get; set; }  
        public int MaxMembers { get; set; }
        public int CurrentMembers { get; set; }

    }
}
