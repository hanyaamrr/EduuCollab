using EduCollabAPI.Data;
using EduCollabAPI.Models;

using EduCollabAPI.Data;
using EduCollabAPI.Hubs;
using EduCollabAPI.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(Options =>
Options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddSignalR();

builder.Services.AddScoped<NotificationService>();

builder.Services.AddHostedService<MeetingReminderService>();

builder.Services.AddControllers();

// Add services to the container.
builder.Services.AddRazorPages();

builder.Services.AddScoped<DiscussionService>();

builder.Services.AddScoped<IAuthRepository, AuthRepository>();

var app = builder.Build();

app.MapControllers();

app.MapHub<NotificationHub>("/hubs/notifications");

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
