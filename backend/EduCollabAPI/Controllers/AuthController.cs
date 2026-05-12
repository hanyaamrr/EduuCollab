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
public class AuthController(IAuthRepository authRepo, IConfiguration config) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(UserRegisterDto request)
    {
        if (await authRepo.UserExists(request.Email) || await authRepo.CreatorRequestExists(request.Email))
        {
            return BadRequest("Email already exists or is pending approval.");
        }

        if ((int)request.Role == 2) 
        {
            var creatorRequest = new CreatorRequest
            {
                Username = request.Username,
                Email = request.Email.ToLower()
            };
            
            await authRepo.RegisterCreatorRequest(creatorRequest, request.Password);
            return Ok(new { status = "Pending", message = "Account pending Admin approval." });
        }
        else 
        {
            var userToCreate = new User
            {
                Username = request.Username,
                Email = request.Email.ToLower(),
                Role = request.Role
            };
            await authRepo.Register(userToCreate, request.Password);
            return Ok(new { status = "Active", message = "Account created successfully." });
        }
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
        
        var tokenValue = config.GetSection("AppSettings:Token").Value;

        if (string.IsNullOrEmpty(tokenValue))
        {
            throw new InvalidOperationException("JWT Token Key is missing from appsettings.json!");
        }

        var key = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(tokenValue));
        
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










