using System.ComponentModel.DataAnnotations;

namespace EduCollabAPI.DTOs
{
    public class RespondToReqDTO
    {
        [Required]
        public int RequestId { get; set; }

        [Required]
        public String Action { get; set; }  //either accept or deny
    }
}
