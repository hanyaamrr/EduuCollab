using EduCollabAPI.DTOs;
using EduCollabAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCollabAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudyGroupController : ControllerBase
    {
        private readonly StudyGroupService _service;
        public StudyGroupController(StudyGroupService service)
        {
            _service = service;
        }

        [HttpPost]
        // [Authorize(Roles = "GroupCreator")]
        public async Task<IActionResult> Create([FromBody] StudyGroupCreateDTO dto)
        {
            var result = await _service.CreateGroup(dto);
            return Ok(result);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAll();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetById(id);
            return Ok(result);
        }

        [HttpGet("location")]
        public async Task<IActionResult> GetByLocation(string location)
        {
            var result = await _service.GetByLocation(location);
            return Ok(result);
        }

        [HttpGet("subject")]
        public async Task<IActionResult> GetBySubject(string subject)
        {
            var result = await _service.GetBySubject(subject);
            return Ok(result);
        }

        [HttpGet("meeting-time")]
        public async Task<IActionResult> GetByMeetingTime(string meetingTime)
        {
            var result = await _service.GetByMeetingTime(meetingTime);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.Delete(id);
            return Ok(result);
        }

        [HttpPost("join")]
        public async Task<IActionResult> Join([FromBody] JoinRequestDTO dto) 
        {
            await _service.RequestJoin(dto);
            return Ok("Join request sent");
        }

        [HttpPost("request/{id}")]
        public async Task<IActionResult> Handle(int id, [FromQuery] bool accept)
        {
            await _service.HandleRequest(id, accept);
            return Ok("Request processed");
        }
        
        [HttpGet("Requests/pending")]
        public async Task<IActionResult> GetPending()
        {
            var result = await _service.GetPendingRequests();
            return Ok(result);
        }

        [HttpGet("MyGroups")]
        public async Task<IActionResult> GetMyGroups([FromQuery] int userId)
        {
            var result = await _service.GetMyGroups(userId);
            return Ok(result);
        }
        
        [HttpGet("CreatedGroups")]
        public async Task<IActionResult> GetCreatedGroups([FromQuery] int creatorId)
        {
            var result = await _service.GetCreatorGroups(creatorId);
            return Ok(result);
        }
        
        [HttpGet("CreatorRequests/pending")]
        public async Task<IActionResult> GetCreatorPending([FromQuery] int creatorId)
        {
            var result = await _service.GetCreatorPendingRequests(creatorId);
            return Ok(result);
        }
        [HttpGet("StudentRequests/{studentId}")]
        public async Task<IActionResult> GetStudentRequests(int studentId) // Removed [FromQuery]
        {
            var result = await _service.GetStudentPendingRequests(studentId);
            return Ok(result);
        }
        
        // DELETE: api/StudyGroup/leave/{groupId}/student/{studentId}
        [HttpDelete("leave/{groupId}/student/{studentId}")]
        public async Task<IActionResult> LeaveGroup(int groupId, int studentId)
        {
            try
            {
                await _service.LeaveGroup(studentId, groupId);
                return Ok(new { message = "Successfully left the group." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
    }
}
