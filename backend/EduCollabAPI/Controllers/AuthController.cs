using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EduCollabAPI.Data;
using EduCollabAPI.DTOs;
using EduCollabAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace EduCollabAPI.Controllers;



[Microsoft.AspNetCore.Components.Route("api/[controller]")]
[ApiController]
[Authorize]
public class AuthController(IAuthRepository authRepo, IConfiguration config) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(UserRegisterDto request)
    {
        if (await authRepo.UserExists(request.Email))
        {
            return BadRequest("Email already exists");
        }

        var userToCreate = new User
        {
            Username = request.Username,
            Email = request.Email.ToLower(),
            Role = request.Role
        };
        
        await authRepo.Register(userToCreate, request.Password);
        return StatusCode(201);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(UserLoginDto request)
    {
        var user = await authRepo.Login(request.Email, request.Password);
        
        if (user == null) return Unauthorized("Invalid username or password!");

        var claim = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
        };
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config.GetSection("AppSettings:Key").Value!));
        
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claim),
            Expires = DateTime.Now.AddDays(1),
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        
        return Ok(new {token = tokenHandler.WriteToken(token)});
    }
    
}










