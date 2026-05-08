using EduCollabAPI.DTOs;
using EduCollabAPI.Models;

namespace EduCollabAPI.Mappers
{
    public static class StudyGroupMapper
    {
        public static StudyGroup ToEntity(StudyGroupCreateDTO dto)
        {
            return new StudyGroup
            {
                Name = dto.Name,
                Subject = dto.Subject,
                Description = dto.Description,
                MaxMembers = dto.MaxMembers,
                MeetingType = dto.MeetingType,
                MeetingSchedule = dto.MeetingSchedule,
                Location = dto.Location,
                CreatorId = dto.CreatorId,
            };
        }

        public static StudyGroupDTO ToDto(StudyGroup group)
        {
            return new StudyGroupDTO
            {
                Id = group.Id,
                Name = group.Name,
                Subject = group.Subject,
                Description = group.Description,
                Location = group.Location,
            };
        }
    }
}
