using System.ComponentModel.DataAnnotations;

namespace EduCollabAPI.DTOs
{
    public class MeetingCreateDTO
    {
        [Required]
        public int GroupId { get; set; }
        
        [Required]
        public DateTime MeetingTime { get; set; }
        
        [Required]
        public string MeetingType { get; set; } 
        
        [Required]
        public string Location { get; set; }
    }

    public class MeetingDTO
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public DateTime MeetingTime { get; set; }
        public string MeetingType { get; set; }
        public string Location { get; set; }
    }
}