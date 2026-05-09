using System.ComponentModel.DataAnnotations;

namespace EduCollabAPI.Models
{

    public enum UserRole
    {
        Admin,
        Student,
        GroupCreator
    }
    
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string Email { get; set; }
        
        
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public UserRole Role { get; set; }
        
    }
    
}
