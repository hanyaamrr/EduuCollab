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
                try // <--- THIS SAVES YOUR WORKER FROM DYING!
                {
                    using var scope = _scopeFactory.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var notifier = scope.ServiceProvider.GetRequiredService<NotificationService>();
                    
                    var now = DateTime.Now;
                    var targetTime = now.AddHours(1);
                    
                    var meetings = context.Meetings
                        .Where(m => 
                            m.MeetingTime > now &&
                            m.MeetingTime <= targetTime &&
                            !m.ReminderSent)
                        .ToList();

                    foreach (var meeting in meetings)
                    {
                        // FIX: Only send to ACCEPTED members!
                        var members = context.GroupMembers
                            .Where(g => g.GroupId == meeting.GroupId && g.Status == "Accepted") 
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
                        
                        meeting.ReminderSent = true;
                    }
                    
                    await context.SaveChangesAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    // If an error happens, print it, but keep the loop alive!
                    Console.WriteLine($"[BACKGROUND WORKER ERROR] {ex.Message}");
                }

                // (Keep this at 5 seconds while testing, then change back to 5 minutes!)
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken); 
            }
        }
    }
}
