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
        private readonly DataRepository<GroupRequest> _groupRequestRepo;


        public StudyGroupService( DataRepository<StudyGroup> groupRepo, DataRepository<GroupMember> requestRepo, DataRepository<GroupRequest> groupRequestRepo)
        {
            _groupRepo = groupRepo;
            _requestRepo = requestRepo;
            _groupRequestRepo = groupRequestRepo; 
        }
        

        public async Task<StudyGroupDTO> CreateGroup(StudyGroupCreateDTO dto)
        {
            // Instead of mapping to StudyGroup, map to GroupRequest
            var request = new GroupRequest
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

            await _groupRequestRepo.AddAsync(request);

            return new StudyGroupDTO { Name = request.Name, Description = "PENDING APPROVAL" }; 
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
            
            // 1. Find if ANY record exists between this student and this group
            var existingRequest = requests.FirstOrDefault(r => 
                r.UserId == dto.StudentId && 
                r.GroupId == dto.StudyGroupId);

            if (existingRequest != null)
            {
                // 2. If it's already pending or accepted, block them
                if (existingRequest.Status == "Pending" || existingRequest.Status == "Accepted")
                {
                    throw new Exception("Request already exists or you are already a member.");
                }
                
                // 3. If they were previously rejected (or left), give them a second chance!
                if (existingRequest.Status == "Rejected")
                {
                    existingRequest.Status = "Pending";
                    await _requestRepo.UpdateAsync(existingRequest);
                    return; // Stop here, we successfully updated it
                }
            }

            // 4. If no record ever existed, create a brand new one
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
            
            // FIX: Use request.GroupId instead of requestId!
            var group = await _groupRepo.GetByIdAsync(request.GroupId); 
            
            // Extra safety check just in case the group was deleted
            if(group == null) 
            {
                throw new Exception("The study group for this request no longer exists.");
            }

            var requests = await _requestRepo.GetAllAsync();

            int count = requests.Count(r => r.GroupId == group.Id && r.Status == "Accepted");
            if (count >= group.MaxMembers)
            {
                throw new Exception("Group is full");
            }

            request.Status = "Accepted";
            await _requestRepo.UpdateAsync(request);
        }
        
        // --- RESTORED ORIGINAL METHOD ---
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
        
        public async Task<List<JoinResponseDTO>> GetCreatorPendingRequests(int creatorId)
        {
            // SECURE FILTERING: Only fetch pending requests for groups owned by THIS creator
            var pending = await _requestRepo.GetAllAsyncInclude(
                m => m.Status == "Pending" && m.StudyGroup.CreatorId == creatorId, 
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
        
        public async Task<List<StudyGroupDTO>> GetCreatorGroups(int creatorId)
        {
            var allGroups = await _groupRepo.GetAllAsync();
            
            var myCreatedGroups = allGroups.Where(g => g.CreatorId == creatorId).ToList();
            
            var allGroupMembers = await _requestRepo.GetAllAsyncInclude(m => true, m => m.User);

            return myCreatedGroups.Select(g => new StudyGroupDTO
            {
                Id = g.Id,
                Name = g.Name,
                Subject = g.Subject,
                Description = g.Description,
                Location = g.Location,
                MeetingType = g.MeetingType,
                MeetingSchedule = g.MeetingSchedule,
                MaxMembers = g.MaxMembers,
                CurrentMembers = allGroupMembers.Count(m => m.GroupId == g.Id && m.Status == "Accepted"),
                
                // The special data only the Creator Dashboard needs:
                EnrolledStudents = allGroupMembers
                    .Where(m => m.GroupId == g.Id && m.Status == "Accepted")
                    .Select(m => m.User.Username)
                    .ToList()
            }).ToList();
        }
        
        public async Task<List<StudyGroupDTO>> GetStudentPendingRequests(int studentId)
        {
            var requests = await _requestRepo.GetAllAsyncInclude(
                m => m.UserId == studentId && m.Status == "Pending",
                m => m.StudyGroup
            );

            return requests.Select(m => new StudyGroupDTO
            {
                Id = m.StudyGroup.Id,
                Name = m.StudyGroup.Name,
                Subject = m.StudyGroup.Subject,
                Description = m.StudyGroup.Description,
                Location = m.StudyGroup.Location,
                MeetingType = m.StudyGroup.MeetingType
            }).ToList();
        }
        
        public async Task LeaveGroup(int studentId, int groupId)
        {
            var requests = await _requestRepo.GetAllAsync();
            
            // Find the exact membership record
            var membership = requests.FirstOrDefault(r => 
                r.UserId == studentId && 
                r.GroupId == groupId && 
                r.Status == "Accepted");

            if (membership == null)
            {
                throw new Exception("You are not an active member of this group.");
            }

            // Actually delete it from the database!
            await _requestRepo.DeleteAsync(membership);
        }

    }
}
