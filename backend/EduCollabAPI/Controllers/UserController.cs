using EduCollabAPI.Data;
using EduCollabAPI.DTOs;
using EduCollabAPI.Models;
using Microsoft.AspNetCore.Mvc;

namespace EduCollabAPI.Controllers;


[Route("api/[controller]")]
[ApiController]
public class UserController(DataRepository<User> userRepo) : ControllerBase
{

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await userRepo.GetAllAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await userRepo.GetByIdAsync(id);
        if (user == null)
        {
            return NotFound(new {message = "User not found"});
        }
        return Ok(user);
    }

    // [HttpPost("CreateUser")]
    // public async Task<IActionResult> CreateUser(UserDto userDto)
    // {
    //     string hashedPassword = BCrypt.Net.BCrypt.HashPassword(userDto.Password);
    //     var user = new User
    //     {
    //         Username = userDto.Username,
    //         Email = userDto.Email,
    //         PasswordHash = hashedPassword,
    //         Role = userDto.Role
    //     };
    //     
    //     await userRepo.AddAsync(user);
    //
    //     return Ok(new { message = "User created successfully!" });
    // }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await userRepo.GetByIdAsync(id);
        if (user == null) return  NotFound();
        await userRepo.DeleteAsync(user);
        return Ok(new { message = "User deleted" });
    }
    
}