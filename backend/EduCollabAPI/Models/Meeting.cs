namespace EduCollabAPI.Models
{
    public class Meeting
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public DateTime MeetingTime { get; set; }
        public string MeetingType { get; set; }
        public string Location { get; set; }
    }
}
