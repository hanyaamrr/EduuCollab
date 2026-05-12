using Azure.Core;
using EduCollabAPI.Data;
using EduCollabAPI.DTOs;
using EduCollabAPI.Mappers;
using EduCollabAPI.Models;

namespace EduCollabAPI.Services
{
    public class StudyGroupService
    {
        private readonly DataRepository<StudyGroup> _groupRepo;
        private readonly DataRepository<GroupMember> _requestRepo;
        private readonly DataRepository<User> _userRepo;


        public StudyGroupService( DataRepository<StudyGroup> groupRepo, DataRepository<GroupMember> requestRepo)
        {
            _groupRepo = groupRepo;
            _requestRepo = requestRepo;
        }
        

        public async Task<StudyGroupDTO> CreateGroup(StudyGroupCreateDTO dto)
        {
            var group = StudyGroupMapper.ToEntity(dto);

            await _groupRepo.AddAsync(group);

            return StudyGroupMapper.ToDto(group);
        }

        public async Task<List<StudyGroupDTO>> GetAll()
        {
            var groups = await _groupRepo.GetAllAsync();

            if (groups == null)
            {
                throw new Exception("Groups not found");
            }

            return groups.Select(StudyGroupMapper.ToDto).ToList();
        }
        public async Task<StudyGroupDTO> GetById(int id)
        {
            var group = await _groupRepo.GetByIdAsync(id);

            if(group == null)
            {
                throw new Exception("Group not found");
            }

            return StudyGroupMapper.ToDto(group);
        }

        public async Task<List<StudyGroupDTO>> GetByLocation(string location)
        {
            var groups = await _groupRepo.GetAllAsync();
            var result = groups.Where(g => !string.IsNullOrEmpty(location) && g.Location.Contains(location)).ToList();

            if (result == null)
            {
                throw new Exception("Group not found");
            }

            return result.Select(StudyGroupMapper.ToDto).ToList();
        }

        public async Task<List<StudyGroupDTO>> GetBySubject(string subject)
        {
            var groups = await _groupRepo.GetAllAsync();
            var result = groups.Where(g => !string.IsNullOrEmpty(subject) && g.Subject.Contains(subject)).ToList();

            if (result == null)
            {
                throw new Exception("Group not found");
            }

            return result.Select(StudyGroupMapper.ToDto).ToList();
        }

        public async Task<List<StudyGroupDTO>> GetByMeetingTime(string meetingTime)
        {
            var groups = await _groupRepo.GetAllAsync();
            var result = groups.Where(g => !string.IsNullOrEmpty(meetingTime) && g.MeetingSchedule.Contains(meetingTime)).ToList();

            if (result == null)
            {
                throw new Exception("Group not found");
            }

            return result.Select(StudyGroupMapper.ToDto).ToList();
        }

        public async Task<string> Delete(int id)
        {
            var group = await _groupRepo.GetByIdAsync(id);
            if (group == null)
            {
                throw new Exception("Group not found");
            }
            await _groupRepo.DeleteAsync(group);
            return "Deleted successfully";
        }
        public async Task RequestJoin(JoinRequestDTO dto)
        {
            var requests = await _requestRepo.GetAllAsync();

            if (requests.Any(r=>r.UserId == dto.StudentId && r.GroupId == dto.StudyGroupId))
            {
                throw new Exception("Request already exists");
            }

            await _requestRepo.AddAsync(new GroupMember
            {
                UserId = dto.StudentId,
                GroupId = dto.StudyGroupId,
                Status = "Pending"
            });
        }

        public async Task HandleRequest(int requestId, bool accept)
        {
            var request = await _requestRepo.GetByIdAsync(requestId);
            if(request == null)
            {
                throw new Exception("Request not found");
            }
            if (!accept)
            {
                request.Status = "Rejected";
                await _requestRepo.UpdateAsync(request);
                return;
            }
            var group = await _groupRepo.GetByIdAsync(requestId);
            var requests = await _requestRepo.GetAllAsync();

            int count = requests.Count(r => r.GroupId == group.Id && r.Status == "Accepted");
            if (count >= group.MaxMembers)
            {
                throw new Exception("Group is full");
            }

            request.Status = "Accepted";
            await _requestRepo.UpdateAsync(request);
        }
        public async Task<List<JoinResponseDTO>> GetPendingRequests()
        {
            var pending = await _requestRepo.GetAllAsyncInclude(
                m => m.Status == "Pending",
                m => m.User,
                m => m.StudyGroup
            );

            return pending.Select(m => new JoinResponseDTO
            {
                Id = m.Id,
                StudentName = m.User.Username,
                GroupName = m.StudyGroup.Name
            }).ToList();
        }

        public async Task<List<StudyGroupDTO>> GetMyGroups(int userId)
        {
            var allMembers = await _requestRepo.GetAllAsync();
            var myGroupIds = allMembers
                .Where(m => m.UserId == userId && m.Status == "Accepted")
                .Select(m => m.GroupId)
                .ToList();

            var allGroups = await _groupRepo.GetAllAsync();

            var myGroups = allGroups
                .Where(g => myGroupIds.Contains(g.Id) || g.CreatorId == userId)
                .ToList();

            var allGroupMembers = await _requestRepo.GetAllAsync();

            return myGroups.Select(g => new StudyGroupDTO
            {
                Id = g.Id,
                Name = g.Name,
                Subject = g.Subject,
                Description = g.Description,
                Location = g.Location,
                MeetingType = g.MeetingType,
                MeetingSchedule = g.MeetingSchedule,
                MaxMembers = g.MaxMembers,
                CurrentMembers = allGroupMembers.Count(m => m.GroupId == g.Id && m.Status == "Accepted")
            }).ToList();
        }

    }
}
