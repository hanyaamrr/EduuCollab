using System.ComponentModel.DataAnnotations;

namespace EduCollabAPI.DTOs
{
    public class MaterialUploadDto
    {
        [Required]
        public IFormFile File { get; set; }

        [Required]
        public string FileName { get; set; }

        [Required]
        public int StudyGroupId { get; set; }

        [Required]
        public int UserId { get; set; }

        public string Tag { get; set; }
    }
}
