using System.ComponentModel.DataAnnotations.Schema;

namespace EduCollabAPI.Models
{
    public class GroupMember
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public int UserId { get; set; }
        public string Status { get; set; }
        
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("GroupId")]
        public virtual StudyGroup StudyGroup { get; set; }
    }
}
