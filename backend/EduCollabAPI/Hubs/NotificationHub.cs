using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace EduCollabAPI.Hubs
{
    public class NotificationHub: Hub
    {
        public override Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            Console.WriteLine($"User connected: {userId}");

            return base.OnConnectedAsync();
        }
    }
}
