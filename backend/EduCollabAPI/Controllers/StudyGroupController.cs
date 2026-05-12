using EduCollabAPI.DTOs;
using EduCollabAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduCollabAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StudyGroupController : ControllerBase
    {
        private readonly StudyGroupService _service;
        public StudyGroupController(StudyGroupService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] StudyGroupCreateDTO dto)
        {
            var result = await _service.CreateGroup(dto);
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
        public async Task<IActionResult> GetBySybject(string subject)
        {
            var result = await _service.GetBySubject(subject);
            return Ok(result);
        }

        [HttpGet("meeting-time")]
        public async Task<IActionResult> GetByMeetingTimr(string meetingTime)
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
    }
}
