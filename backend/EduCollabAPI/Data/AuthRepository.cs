using EduCollabAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace EduCollabAPI.Data;


public interface IAuthRepository
{
    Task<User?> Login(string email, string password);
    Task<User> Register(User user, string password);
    Task<bool> UserExists(string email);
    Task<bool> CreatorRequestExists(string email);
    Task<CreatorRequest> RegisterCreatorRequest(CreatorRequest request, string password);
}

public class AuthRepository(AppDbContext db) : IAuthRepository
{

    public async Task<User?> Login(string email, string password)
    {
        var user = await db.Users.FirstOrDefaultAsync(x => x.Email.ToLower() == email.ToLower());
        
        if (user == null) return null;

        return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash) ? user : null;
    }

    public async Task<User> Register(User user, string password)
    {
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
        await db.Users.AddAsync(user);
        await db.SaveChangesAsync();
        return user;
    }
    
    public async Task<bool> UserExists(string email)
    {
        return await db.Users.AnyAsync(x => x.Email.ToLower() == email.ToLower());
    }
    
    public async Task<bool> CreatorRequestExists(string email)
    {
        return await db.CreatorRequests.AnyAsync(x => x.Email.ToLower() == email.ToLower());
    }

    public async Task<CreatorRequest> RegisterCreatorRequest(CreatorRequest request, string password)
    {
        request.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
        await db.CreatorRequests.AddAsync(request);
        await db.SaveChangesAsync();
        return request;
    }
    
}