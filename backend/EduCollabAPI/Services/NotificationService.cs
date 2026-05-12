using EduCollabAPI.Data;
using EduCollabAPI.Hubs;
using EduCollabAPI.Models;
using Microsoft.AspNetCore.SignalR;

namespace EduCollabAPI.Services
{
    public class NotificationService
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;
        
        public NotificationService(AppDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task SendAsync(int userId, string title, string message)
        {
            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Message = message
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            await _hubContext
                .Clients
                .User(userId.ToString())
                .SendAsync("ReceiveNotification", title, message);
        }
    }
}
