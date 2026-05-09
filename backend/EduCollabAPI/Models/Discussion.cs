using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduCollabAPI.Models
{
    public class Discussion
    {
        [Key]
        public int MessageId { get; set; }

        [Required]
        public string Content { get; set; }

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        public bool IsDeleted { get; set; } = false;

        
        [Required]
        public int StudyGroupId { get; set; }

        [Required]
        public string SenderId { get; set; }

        
        [ForeignKey("StudyGroupId")]
        public virtual StudyGroup StudyGroup { get; set; }

        [ForeignKey("SenderId")]
        public virtual User Sender { get; set; }
    }
}