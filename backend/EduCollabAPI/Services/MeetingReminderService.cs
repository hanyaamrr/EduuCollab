using EduCollabAPI.Data;

namespace EduCollabAPI.Services
{
    public class MeetingReminderService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        public MeetingReminderService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var notifier = scope.ServiceProvider.GetRequiredService<NotificationService>();
                var now = DateTime.Now;
                var targetTime = now.AddHours(1);
                var meetings = context.Meetings
                    .Where(m => 
                        m.MeetingTime > now &&
                        m.MeetingTime <= targetTime)
                    .ToList();
                foreach (var meeting in meetings)
                {
                    var members = context.GroupMembers
                        .Where(g => g.GroupId == meeting.GroupId)
                        .Select(g => g.UserId)
                        .ToList();
                    foreach(var userId in members)
                    {
                        await notifier.SendAsync(
                            userId,
                            "Meeting Reminder",
                            $"Meeting starts in 1 hour. Location: {meeting.Location}"
                        );
                    }
                }
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}
