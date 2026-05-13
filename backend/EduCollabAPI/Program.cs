using System.Text;
using EduCollabAPI.Data;
using EduCollabAPI.Models;
using EduCollabAPI.Hubs;
using EduCollabAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// --- SERVICES REGISTRATION ---
builder.Services.AddDbContext<AppDbContext>(Options =>
    Options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<NotificationService>();
builder.Services.AddHostedService<MeetingReminderService>();

builder.Services.AddControllers();
builder.Services.AddRazorPages();

builder.Services.AddScoped<DiscussionService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped(typeof(DataRepository<>));
builder.Services.AddScoped<StudyGroupService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

        // --- ADD THIS ENTIRE EVENTS SECTION ---
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                
                // If the request is for our hub...
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notifications"))
                {
                    // Read the token out of the query string so SignalR can authorize the user!
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
        // --------------------------------------
    });

// SIGNALR & CORS REGISTRATION
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Crucial for SignalR!
    });
});

var app = builder.Build();

// --- MIDDLEWARE PIPELINE (ORDER IS CRITICAL) ---
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

// 1. ROUTING
app.UseRouting();

// 2. CORS (Must go exactly here!)
app.UseCors("AllowReact");

// --- Default Admin Creation ---
using (var scope = app.Services.CreateScope())
{
    var authRepo = scope.ServiceProvider.GetRequiredService<IAuthRepository>();
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

// 3. AUTHENTICATION & AUTHORIZATION
app.UseAuthentication();
app.UseAuthorization();

// 4. ENDPOINT MAPPING
app.MapControllers();
app.MapRazorPages();

// FIX: Changed to exactly match your React frontend URL
app.MapHub<NotificationHub>("/notifications"); 

// SWAGGER
app.UseSwagger();
app.UseSwaggerUI();

app.Run();