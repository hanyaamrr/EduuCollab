using EduCollabAPI.Data;
using EduCollabAPI.Models;

namespace EduCollabAPI.Services
{
    public class GroupMemberService
    {
        private readonly DataRepository<GroupMember> _memberRepo;

        public GroupMemberService(DataRepository<GroupMember> memberRepo)
        {
            _memberRepo = memberRepo;
        }

        public async Task<bool> IsUserInGroup(int userId, int groupId)
        {
            IEnumerable<GroupMember> members = await _memberRepo.GetAllAsync();

            foreach (GroupMember member in members)
            {

                if (member.GroupId == groupId && member.UserId == userId && member.Status == "Accepted")
                {
                    return true; 
                }
            }

            return false;
        }
    }
}
