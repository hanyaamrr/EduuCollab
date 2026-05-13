using EduCollabAPI.Data;
using EduCollabAPI.DTOs;
using EduCollabAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduCollabAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeetingController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MeetingController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/meeting
        [HttpPost]
        public async Task<IActionResult> CreateMeeting([FromBody] MeetingCreateDTO dto)
        {
            // 1. Safety Check: Don't allow time travel
            if (dto.MeetingTime <= DateTime.Now)
            {
                return BadRequest("Meeting time must be in the future.");
            }

            // 2. Map the DTO to your actual Model
            var meeting = new Meeting
            {
                GroupId = dto.GroupId,
                MeetingTime = dto.MeetingTime,
                MeetingType = dto.MeetingType,
                Location = dto.Location,
                ReminderSent = false // Automatically set our new anti-spam flag!
            };

            // 3. Save to database
            _context.Meetings.Add(meeting);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Meeting scheduled successfully!", meetingId = meeting.Id });
        }

        // GET: api/meeting/group/{groupId}
        [HttpGet("group/{groupId}")]
        public async Task<IActionResult> GetGroupMeetings(int groupId)
        {
            // Fetch all future meetings for this specific group, ordered by the soonest
            var meetings = await _context.Meetings
                .Where(m => m.GroupId == groupId && m.MeetingTime >= DateTime.Now) 
                .OrderBy(m => m.MeetingTime)
                .Select(m => new MeetingDTO
                {
                    Id = m.Id,
                    GroupId = m.GroupId,
                    MeetingTime = m.MeetingTime,
                    MeetingType = m.MeetingType,
                    Location = m.Location
                })
                .ToListAsync();

            return Ok(meetings);
        }
    }
}