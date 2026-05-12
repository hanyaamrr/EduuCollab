using System.ComponentModel.DataAnnotations;

namespace EduCollabAPI.Models
{
    public class CreatorRequest
    {
        [Key]
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; } // Store the hashed password!
        public DateTime RequestedAt { get; set; } = DateTime.Now;
    }
}