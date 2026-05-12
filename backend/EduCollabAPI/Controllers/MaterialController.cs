using EduCollabAPI.Data;
using EduCollabAPI.DTOs;
using EduCollabAPI.Models;
using Microsoft.AspNetCore.Authorization;
using EduCollabAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace EduCollabAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MaterialController : ControllerBase
    {
        private readonly MaterialService _materialService;
        private readonly GroupMemberService _membershipService;

        public MaterialController(MaterialService materialService, GroupMemberService membershipService)
        {
            _materialService = materialService;
            _membershipService = membershipService;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] MaterialUploadDto dto)
        {
            bool isMember = await _membershipService.IsUserInGroup(dto.UserId, dto.StudyGroupId);

            if (!isMember)
            {
                return Forbid("You aren't an accepted member of this group.");
            }

            var result = await _materialService.UploadMaterial(dto);
            if (result.ErrorMessage != null)
                return BadRequest(result.ErrorMessage);

            return Ok(result.Material);
        }

        [HttpGet("group/{groupId}/search-tag")]
        public async Task<IActionResult> GetByTag(int groupId, [FromQuery] string tag, [FromQuery] int userId)
        {
            bool isMember = await _membershipService.IsUserInGroup(userId, groupId);

            if (!isMember)
            {
                return Forbid("You aren't an accepted member of this group.");
            }

            var result = await _materialService.GetMaterialsByTagAsync(groupId, tag);
            if (result.ErrorMessage != null)
                return BadRequest(result.ErrorMessage);

            return Ok(result.MaterialList);
        }

        [HttpGet("group/{groupId}/search-name")]
        public async Task<IActionResult> GetByName(int groupId, [FromQuery] string fileName, [FromQuery] int userId)
        {
            bool isMember = await _membershipService.IsUserInGroup(userId, groupId);

            if (!isMember)
            {
                return Forbid("You aren't an accepted member of this group.");
            }

            var result = await _materialService.GetMaterialsByNameAsync(groupId, fileName);
            if (result.ErrorMessage != null)
                return BadRequest(result.ErrorMessage);

            return Ok(result.MaterialList);
        }

        [HttpGet("group/{groupId}")]
        public async Task<IActionResult> GetAll(int groupId, [FromQuery] int userId)
        {
            bool isMember = await _membershipService.IsUserInGroup(userId, groupId);
            if (!isMember)
                return Forbid("You aren't an accepted member of this group.");

            var result = await _materialService.GetAllMaterialsAsync(groupId);
            if (result.ErrorMessage != null)
                return BadRequest(result.ErrorMessage);

            return Ok(result.MaterialList);
        }

        [HttpGet("download/{id}")]
        public async Task<IActionResult> Download(int id, [FromQuery] int userId)
        {
            var result = await _materialService.DownloadMaterialAsync(id);

            if (result.ErrorMessage != null)
                return NotFound(result.ErrorMessage);

            return File(result.Bytes, result.FileType, result.FileName);
        }

        [HttpDelete("DeleteMaterial/{id}")]
        public async Task<IActionResult> DeleteMaterial(int id, [FromQuery] int userId)
        {

            var all = await _materialService.GetMaterialsByTagAsync(0, null);

            Material materialToDelete = null;
            foreach (var m in all.MaterialList)
            {
                if (m.Id == id)
                    materialToDelete = m;
            }

            var result = await _materialService.DeleteMaterialAsync(materialToDelete, userId);

            if (result.ErrorMessage != null)
                return BadRequest(result.ErrorMessage);

            return NoContent();
        }
    }
}
