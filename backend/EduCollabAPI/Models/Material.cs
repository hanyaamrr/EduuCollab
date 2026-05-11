using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCollabAPI.Models
{
    public class Material
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string FileName { get; set; } = string.Empty;
        [Required]
        public string FilePath { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public string Tag { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;


        [Required]
        [ForeignKey("StudyGroupId")]
        public int StudyGroupId { get; set; }

        [Required]
        [ForeignKey("UploadedByUserId")]
        public string UploadedByUserId { get; set; } = string.Empty; 

    }

}
