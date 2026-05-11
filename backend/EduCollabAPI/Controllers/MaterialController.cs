using EduCollabAPI.Data;
using EduCollabAPI.DTOs;
using EduCollabAPI.Models;
using Microsoft.AspNetCore.Mvc;

namespace EduCollabAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialController : ControllerBase
    {
        private readonly DataRepository<Material> _materialRepo;
        private readonly DataRepository<StudyGroup> _groupRepo;
        private readonly DataRepository<User> _userRepo;

        public MaterialController(DataRepository<Material> materialRepo, DataRepository<StudyGroup> groupRepo, DataRepository<User> userRepo)
        {
            _materialRepo = materialRepo;
            _groupRepo = groupRepo;
            _userRepo = userRepo;
        }


        [HttpPost("upload")]
        public async Task<ActionResult> UploadMaterial([FromForm] MaterialUploadDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                return BadRequest(new { message = "Please provide a valid file." });

            var targetGroup = await _groupRepo.GetByIdAsync(dto.StudyGroupId);
            if (targetGroup == null)
            {
                return NotFound(new { message = "The specified destination study group does not exist." });
            }

            //user validation after the authentication is done

            var material = new Material
            {
                FileName = dto.File.FileName,
                FileType = Path.GetExtension(dto.File.FileName),
                Tag = dto.Tag,
                UploadedAt = DateTime.Now,
                StudyGroupId = dto.StudyGroupId,
                //UploadedByUserId = 
            };

            await _materialRepo.AddAsync(material);
            int newId = material.Id;

            var uniqueFileName = $"{newId}_{dto.File.FileName}";
            var folder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var fullPath = Path.Combine(folder, uniqueFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            material.FilePath = fullPath;
            await _materialRepo.UpdateAsync(material);

            return Ok(new { message = "Upload successful!", id = newId , fileName=uniqueFileName });
        }

        [HttpGet("download/{id}")]
        public async Task<ActionResult> DownloadMaterial(int id)
        {
            var material = await _materialRepo.GetByIdAsync(id);
            if (material == null)
            {
                return NotFound(new { message = "file does not exist." });
            }

            if (!(System.IO.File.Exists(material.FilePath)))
            {
                return NotFound(new { message = "The physical file could not be found." });
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(material.FilePath);

            return File(fileBytes, "application/octet-stream", material.FileName);
        }

        //[HttpGet("search/{groupId}")]
        //public async Task<ActionResult<IEnumerable<Material>>> Search(int groupId, [FromQuery] string? tag)
        //{
        //    // Bug Prevention: First, make sure the study group actually exists
        //    var groupExists = await _groupRepo.GetByIdAsync(groupId);
        //    if (groupExists == null)
        //    {
        //        return NotFound(new { message = "Cannot search materials. The specified study group does not exist." });
        //    }

        //    // Build base filtering criteria to only pull materials belonging to THIS group
        //    Expression<Func<Material, bool>> criteria = m => m.StudyGroupId == groupId;

        //    // If the student typed or clicked a specific tag, narrow down the query
        //    if (!string.IsNullOrEmpty(tag))
        //    {
        //        criteria = m => m.StudyGroupId == groupId && m.Tag.Contains(tag);
        //    }

        //    // Eagerly load the UploadedBy profile information so React can display who shared it
        //    var results = await _materialRepo.GetAllAsyncInclude(criteria, m => m.UploadedBy!);

        //    return Ok(results);
        //}

        //[HttpDelete("{id}")]
        //public async Task<IActionResult> Delete(int id)
        //{
        //    var material = await _repo.GetByIdAsync(id);
        //    if (material == null) return NotFound();

        //    // Remove physical file first
        //    if (System.IO.File.Exists(material.FilePath))
        //        System.IO.File.Delete(material.FilePath);

        //    // Remove DB record
        //    await _repo.DeleteAsync(id);
        //    return NoContent();
        //}
    }
}
