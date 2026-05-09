using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EduCollabAPI.Data;
using EduCollabAPI.DTOs;
using EduCollabAPI.Models;

namespace EduCollabAPI.Services
{
    public class DiscussionService
    {
        private readonly AppDbContext _context;

        public DiscussionService(AppDbContext context)
        {
            _context = context;
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        private async Task<bool> IsMemberAsync(int studyGroupId, string userId)
        {
            var group = await _context.StudyGroups
                .FirstOrDefaultAsync(g => g.StudyGroupId == studyGroupId);

            if (group == null) return false;
            if (group.CreatorId == userId) return true;

            return await _context.GroupMembers
                .AnyAsync(m => m.StudyGroupId == studyGroupId
                            && m.StudentId == userId
                            && m.Status == MembershipStatus.Accepted);
        }

        private static MessageResponseDto MapToDto(Discussion m) => new MessageResponseDto
        {
            MessageId = m.MessageId,
            Content = m.Content,
            SentAt = m.SentAt,
            StudyGroupId = m.StudyGroupId,
            SenderId = m.SenderId,
            SenderName = m.Sender?.UserName
        };

        // ── Public Methods ─────────────────────────────────────────────────────

        /// <summary>Get all messages for a group chat (oldest first), paginated.</summary>
        public async Task<IEnumerable<MessageResponseDto>> GetMessagesAsync(
            int studyGroupId, string requesterId, int page = 1, int pageSize = 50)
        {
            if (!await IsMemberAsync(studyGroupId, requesterId))
                throw new UnauthorizedAccessException("You must be a group member to view messages.");

            var messages = await _context.GroupMessages
                .Include(m => m.Sender)
                .Where(m => m.StudyGroupId == studyGroupId && !m.IsDeleted)
                .OrderBy(m => m.SentAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return messages.Select(MapToDto);
        }

        /// <summary>Send a message to the group chat.</summary>
        public async Task<MessageResponseDto> SendMessageAsync(SendMessageDto dto, string senderId)
        {
            if (!await IsMemberAsync(dto.StudyGroupId, senderId))
                throw new UnauthorizedAccessException("You must be a group member to send messages.");

            var message = new Discussion
            {
                Content = dto.Content,
                StudyGroupId = dto.StudyGroupId,
                SenderId = senderId,
                SentAt = DateTime.UtcNow
            };

            _context.GroupMessages.Add(message);
            await _context.SaveChangesAsync();

            // Reload with sender info
            await _context.Entry(message).Reference(m => m.Sender).LoadAsync();

            return MapToDto(message);
        }

        /// <summary>Delete a message (sender only).</summary>
        public async Task<bool> DeleteMessageAsync(int messageId, string requesterId)
        {
            var message = await _context.GroupMessages
                .FirstOrDefaultAsync(m => m.MessageId == messageId && !m.IsDeleted);

            if (message == null)
                throw new KeyNotFoundException($"Message {messageId} not found.");

            if (message.SenderId != requesterId)
                throw new UnauthorizedAccessException("You can only delete your own messages.");

            message.IsDeleted = true;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}