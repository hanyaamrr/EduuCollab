using EduCollabAPI.Data;
using EduCollabAPI.DTOs;
using EduCollabAPI.Models;

namespace EduCollabAPI.Services
{
    public class MaterialService
    {
        private readonly DataRepository<Material> _materialRepo;
        private readonly DataRepository<StudyGroup> _groupRepo;
        private readonly DataRepository<User> _userRepo;

        public MaterialService(DataRepository<Material> materialRepo, DataRepository<StudyGroup> groupRepo, DataRepository<User> userRepo)
        {
            _materialRepo = materialRepo;
            _groupRepo = groupRepo;
            _userRepo = userRepo;
        }

        public class MaterialResult 
        {
            public string ErrorMessage { get; set; }
            public Material Material { get; set; }
            public List<Material> MaterialList { get; set; }
        }
        public class DownloadResult
        {
            public byte[] Bytes { get; set; }
            public string FileType { get; set; }
            public string FileName { get; set; }
            public string ErrorMessage { get; set; }
        }

        public async Task<MaterialResult> UploadMaterial( MaterialUploadDto dto)
        {
            if (dto.File == null || dto.File.Length == 0)
                return  new MaterialResult{ ErrorMessage = "Please provide a valid file." };

            var targetGroup = await _groupRepo.GetByIdAsync(dto.StudyGroupId);
            if (targetGroup == null)
                return new MaterialResult { ErrorMessage = "The specified destination study group does not exist." };

            var user = await _userRepo.GetByIdAsync(dto.UserId);
            if (user == null)
                return new MaterialResult { ErrorMessage = "User not found." };

            var allowedExtensions = new List<string> { ".jpg", ".png", ".pdf", ".docx", ".pptx" };
            var ext = Path.GetExtension(dto.File.FileName).ToLower();
            if (!allowedExtensions.Contains(ext))
                return new MaterialResult { ErrorMessage = "Invalid file type. Allowed: PDF, DOCX, PPTX, JPG, PNG" };

            if (dto.File.Length > (10 * 1024 * 1024))
                return new MaterialResult { ErrorMessage = "File is too large (Max 10MB)." };
            try
            {

                var uniqueFileName = Guid.NewGuid().ToString() + ext;
                var folder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

                if (!Directory.Exists(folder))
                    Directory.CreateDirectory(folder);

                var fullPath = Path.Combine(folder, uniqueFileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await dto.File.CopyToAsync(stream);
                }

                var material = new Material
                {
                    FileName = dto.File.FileName,
                    Tag = dto.Tag,
                    StudyGroupId = dto.StudyGroupId,
                    UploadedByUserId = dto.UserId,
                    FilePath = Path.Combine("uploads", uniqueFileName)
                };

                await _materialRepo.AddAsync(material);
                return new MaterialResult { Material = material };
            }
            catch (Exception e)
            {
                return new MaterialResult { ErrorMessage = "An error occurred while saving the file." };
            }
        }

        public async Task<MaterialResult> GetMaterialsByTagAsync(int groupId, string tag)
        {

            var materials = await _materialRepo.GetAllAsyncInclude(
                m => m.StudyGroupId == groupId && (tag!=null || m.Tag.Contains(tag)),
                m => m.UploadedByUserId
            );

            return new MaterialResult { MaterialList = materials.ToList() };
        }

        public async Task<MaterialResult> GetMaterialsByNameAsync(int groupId, string fileName)
        {

            var materials = await _materialRepo.GetAllAsyncInclude(
                m => m.StudyGroupId == groupId && (fileName != null || m.FileName.Contains(fileName)),
                m => m.UploadedByUserId
            );

            return new MaterialResult { MaterialList = materials.ToList() };
        }

        public async Task<MaterialResult> GetAllMaterialsAsync(int groupId)
        {
            var materials = await _materialRepo.GetAllAsync();
            var result = materials.Where(m => m.StudyGroupId == groupId).ToList();
            return new MaterialResult { MaterialList = result };
        }

        public async Task<DownloadResult> DownloadMaterialAsync(int id)
        {
            var material = await _materialRepo.GetByIdAsync(id);

            if (material == null || string.IsNullOrEmpty(material.FilePath))
                return new DownloadResult { ErrorMessage = "Material not found" };

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), material.FilePath);

            if (!File.Exists(filePath))
                return new DownloadResult { ErrorMessage = "Physical file not found" };

            var provider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(filePath, out var fileType))
            {
                fileType = "application/octet-stream";
            }

            var bytes = await File.ReadAllBytesAsync(filePath);

            return new DownloadResult
            {
                Bytes = bytes,
                FileType = fileType,
                FileName = material.FileName
            };
        }

        public async Task<MaterialResult> DeleteMaterialAsync(Material material, int userId)
        {
            if (material == null)
                return new MaterialResult { ErrorMessage = "Material not found" };

            if (material.UploadedByUserId != userId)
                return new MaterialResult { ErrorMessage = "You do not have permission to delete this" };

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), material.FilePath);
            if (File.Exists(filePath)) File.Delete(filePath);

            await _materialRepo.DeleteAsync(material);
            return new MaterialResult(); 
        }
    }
}
