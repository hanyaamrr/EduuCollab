using EduCollabAPI.Models;

namespace EduCollabAPI.DTOs;

public class UserRegisterDto
{
    public string Username { get; set; } =  string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
}