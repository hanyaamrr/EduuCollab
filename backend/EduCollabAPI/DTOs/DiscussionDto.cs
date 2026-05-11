using System;
using System.ComponentModel.DataAnnotations;

namespace EduCollabAPI.DTOs
{
    public class SendMessageDto
    {
        [Required]
        public string Content { get; set; }

        [Required]
        public int StudyGroupId { get; set; }
    }

    public class MessageResponseDto
    {
        public int MessageId { get; set; }
        public string Content { get; set; }
        public DateTime SentAt { get; set; }
        public int StudyGroupId { get; set; }
        public int SenderId { get; set; }
        public string SenderName { get; set; }
    }
}