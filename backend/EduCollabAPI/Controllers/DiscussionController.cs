using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduCollabAPI.DTOs;
using EduCollabAPI.Services;

namespace EduCollabAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DiscussionController : ControllerBase
    {
        private readonly DiscussionService _discussionService;

        public DiscussionController(DiscussionService discussionService)
        {
            _discussionService = discussionService;
        }

        // BUG 5 FIXED: int.Parse will throw FormatException if the claim is null or non-numeric.
        // Use a null-safe parse so the API returns 401 instead of crashing with a 500.
        private int CurrentUserId
        {
            get
            {
                var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out var id))
                    throw new UnauthorizedAccessException("Invalid or missing user identity claim.");
                return id;
            }
        }

        [HttpGet("group/{groupId}")]
        public async Task<ActionResult<IEnumerable<MessageResponseDto>>> GetMessages(
            int groupId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            try
            {
                var result = await _discussionService.GetMessagesAsync(groupId, CurrentUserId, page, pageSize);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                // BUG 6 FIXED: Forbid(string) doesn't exist in ASP.NET Core — Forbid() takes no
                // arguments (or an authScheme). Returning a 403 with a message requires ObjectResult.
                return StatusCode(403, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<MessageResponseDto>> Send([FromBody] SendMessageDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var result = await _discussionService.SendMessageAsync(dto, CurrentUserId);
                return CreatedAtAction(nameof(GetMessages),
                    new { groupId = result.StudyGroupId }, result);
            }
            catch (UnauthorizedAccessException ex)
            {
                // BUG 6 FIXED (same as above): replaced Forbid(ex.Message) with StatusCode 403.
                return StatusCode(403, new { message = ex.Message });
            }
        }

        // BUG 7 FIXED: Was calling DeleteMessageAsync(id, CurrentUserId) but the original
        // service signature had (int messageId, string requesterId) — type mismatch meant
        // CurrentUserId (int) was being passed where a string was expected, causing a
        // compile error. Now that the service is fixed to int, this call is correct.
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _discussionService.DeleteMessageAsync(id, CurrentUserId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                // BUG 6 FIXED (same as above): replaced Forbid(ex.Message).
                return StatusCode(403, new { message = ex.Message });
            }
        }
    }
}