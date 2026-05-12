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

        private async Task<bool> IsMemberAsync(int studyGroupId, int userId)
        {
            var group = await _context.StudyGroups
                .FirstOrDefaultAsync(g => g.Id == studyGroupId);

            if (group == null) return false;
            if (group.CreatorId == userId) return true;

            return await _context.GroupMembers
                .AnyAsync(m => m.GroupId == studyGroupId
                            && m.UserId == userId
                            && m.Status == "Accepted");
        }

        private static MessageResponseDto MapToDto(Discussion m) => new MessageResponseDto
        {
            MessageId = m.MessageId,
            Content = m.Content,
            SentAt = m.SentAt,
            StudyGroupId = m.StudyGroupId,
            SenderId = m.SenderId,
            SenderName = m.Sender?.Username
        };

        public async Task<IEnumerable<MessageResponseDto>> GetMessagesAsync(
            int studyGroupId, int requesterId, int page = 1, int pageSize = 50)
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

        public async Task<MessageResponseDto> SendMessageAsync(SendMessageDto dto, int senderId)
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

            await _context.Entry(message).Reference(m => m.Sender).LoadAsync();

            return MapToDto(message);
        }

        public async Task<bool> DeleteMessageAsync(int messageId, int requesterId)
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