using System.Text;
using EduCollabAPI.Data;
using EduCollabAPI.Models;

using EduCollabAPI.Data;
using EduCollabAPI.Hubs;
using EduCollabAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(Options =>
Options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddSignalR();

builder.Services.AddScoped<NotificationService>();

builder.Services.AddHostedService<MeetingReminderService>();

builder.Services.AddControllers();

// Add services to the container.
builder.Services.AddRazorPages();


builder.Services.AddScoped<IAuthRepository, AuthRepository>();


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8
                .GetBytes(builder.Configuration.GetSection("AppSettings:Token").Value!)),
            ValidateIssuer = false,   
            ValidateAudience = false  
        };
    });

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

using (var scope = app.Services.CreateScope())
{
    var authRepo =  scope.ServiceProvider.GetRequiredService<IAuthRepository>();
    string adminEmail = "admin@educollab.com";
    if (!await authRepo.UserExists(adminEmail))
    {
        var adminUser = new User
        {
            Username = "SystemAdmin",
            Email = adminEmail,
            Role = UserRole.Admin
        };
        await authRepo.Register(adminUser, "admin123123");
        Console.WriteLine("Default Admin user created successfully.");
    }
}

app.UseAuthentication();
app.UseAuthorization();

app.MapRazorPages();

app.Run();
