using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCollabAPI.Models
{
    public class Material
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string FileName { get; set; } 

        [Required]
        [FileExtensions(Extensions = "jpg,jpeg,png,pdf,docx,pptx")]
        public string FilePath { get; set; } 

        public string Tag { get; set; } 
        public DateTime UploadedAt { get; set; } = DateTime.Now;


        [ForeignKey("StudyGroupId")]
        public int StudyGroupId { get; set; }

        [ForeignKey("UploadedByUserId")]
        public int UploadedByUserId { get; set; }

    }

}
