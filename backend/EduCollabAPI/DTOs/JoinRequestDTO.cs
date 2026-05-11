using System.ComponentModel.DataAnnotations;

namespace EduCollabAPI.DTOs
{
    public class JoinRequestDTO
    {
        [Required]
        public int StudyGroupId { get; set; }

        [Required]
        public int StudentId { get; set; }

    }
}
