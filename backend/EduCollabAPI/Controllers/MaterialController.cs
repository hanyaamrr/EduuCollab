// using EduCollabAPI.Data;
// using EduCollabAPI.DTOs;
// using EduCollabAPI.Models;
// using Microsoft.AspNetCore.Mvc;

// namespace EduCollabAPI.Controllers
// {
//     [Route("api/[controller]")]
//     [ApiController]
//     public class MaterialController : ControllerBase
//     {
//         private readonly DataRepository<Material> _repo;

//         public MaterialController(DataRepository<Material> repo)
//         {
//             _repo = repo;
//         }


//         [HttpPost("upload")]
//         public async Task<ActionResult> Upload([FromForm] MaterialUploadDto dto)
//         {
//             if (dto.File == null || dto.File.Length == 0)
//                 return BadRequest("Please provide a valid file.");

//             var material = new Material
//             {
//                 FileName = dto.File.FileName,
//                 FileType = Path.GetExtension(dto.File.FileName),
//                 Tag = dto.Tag,
//                 UploadedAt = DateTime.UtcNow,
//                 StudyGroupId = dto.StudyGroupId,
//                 UploadedByUserId = "temp-user-id" // Replace with real ID later
//             };

//             int newId = await _repo.AddAsync(material);

//             var uniqueFileName = $"{newId}_{dto.File.FileName}";
//             var folder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

//             if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

//             var fullPath = Path.Combine(folder, uniqueFileName);

//             using (var stream = new FileStream(fullPath, FileMode.Create))
//             {
//                 await dto.File.CopyToAsync(stream);
//             }

//             material.FilePath = fullPath;
//             await _repo.UpdateAsync(material);

//             return Ok(new { message = "Upload successful!", id = newId });
//         }

//         //[HttpGet("search")]
//         //public async Task<ActionResult> Search(int groupId, string tag)
//         //{
//         //    var results = await _repo.SearchByTagAsync(groupId, tag.ToLower());
//         //    return Ok(results);
//         //}

//         //[HttpGet("download/{id}")]
//         //public async Task<IActionResult> Download(int id)
//         //{
//         //    var material = await _repo.GetByIdAsync(id);
//         //    if (material == null) return NotFound("Material not found.");

//         //    if (!System.IO.File.Exists(material.FilePath)) return NotFound("Physical file missing.");

//         //    var bytes = await System.IO.File.ReadAllBytesAsync(material.FilePath);
//         //    return File(bytes, "application/octet-stream", material.FileName);
//         //}

//         //[HttpDelete("{id}")]
//         //public async Task<IActionResult> Delete(int id)
//         //{
//         //    var material = await _repo.GetByIdAsync(id);
//         //    if (material == null) return NotFound();

//         //    // Remove physical file first
//         //    if (System.IO.File.Exists(material.FilePath))
//         //        System.IO.File.Delete(material.FilePath);

//         //    // Remove DB record
//         //    await _repo.DeleteAsync(id);
//         //    return NoContent();
//         //}
//     }
// }
