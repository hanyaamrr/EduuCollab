using System.ComponentModel.DataAnnotations;

namespace EduCollabAPI.DTOs
{
    public class MaterialUploadDto
    {
        [Required]
        public IFormFile File { get; set; } = null!;
        [Required]
        public int StudyGroupId { get; set; }
        public string Tag { get; set; } = string.Empty;
    }
}
