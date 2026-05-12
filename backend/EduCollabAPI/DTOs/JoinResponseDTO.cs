namespace EduCollabAPI.DTOs
{
    public class JoinResponseDTO
    {
        public int Id { get; set; }
        public string StudentName { get; set; }
        public string GroupName { get; set; }
        public DateTime RequestedAt { get; set; }
    }
}
