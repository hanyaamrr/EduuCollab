using EduCollabAPI.Data;
using EduCollabAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduCollabAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] 
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }
        
        
        [HttpGet("creators/pending")]
        public async Task<IActionResult> GetPendingCreators()
        {
            return Ok(await _context.CreatorRequests.ToListAsync());
        }

        [HttpPost("creators/handle/{id}")]
        public async Task<IActionResult> HandleCreator(int id, [FromQuery] bool approve)
        {
            var request = await _context.CreatorRequests.FindAsync(id);
            if (request == null) return NotFound("Request not found");

            if (approve)
            {
                var newUser = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    PasswordHash = request.PasswordHash, // Use the already hashed password
                    Role = UserRole.GroupCreator // or 2
                };
                _context.Users.Add(newUser);
            }

            _context.CreatorRequests.Remove(request);
            await _context.SaveChangesAsync();
            return Ok(approve ? "Creator approved" : "Creator rejected");
        }
        

        [HttpGet("groups/pending")]
        public async Task<IActionResult> GetPendingGroups()
        {
            return Ok(await _context.GroupRequests.ToListAsync());
        }

        [HttpPost("groups/handle/{id}")]
        public async Task<IActionResult> HandleGroup(int id, [FromQuery] bool approve)
        {
            var request = await _context.GroupRequests.FindAsync(id);
            if (request == null) return NotFound("Request not found");

            if (approve)
            {
                var newGroup = new StudyGroup
                {
                    Name = request.Name,
                    Subject = request.Subject,
                    Description = request.Description,
                    MaxMembers = request.MaxMembers,
                    MeetingType = request.MeetingType,
                    MeetingSchedule = request.MeetingSchedule,
                    Location = request.Location,
                    CreatorId = request.CreatorId
                };
                _context.StudyGroups.Add(newGroup);
            }

            _context.GroupRequests.Remove(request);
            await _context.SaveChangesAsync();
            return Ok(approve ? "Group approved" : "Group rejected");
        }
    }
}