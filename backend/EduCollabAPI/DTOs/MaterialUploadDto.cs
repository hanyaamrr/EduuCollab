namespace EduCollabAPI.DTOs
{
    public class MaterialUploadDto
    {
        public IFormFile File { get; set; } = null!;
        public int StudyGroupId { get; set; }
        public string Tag { get; set; } = string.Empty;
    }
}
