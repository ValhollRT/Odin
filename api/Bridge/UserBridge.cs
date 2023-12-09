using Microsoft.EntityFrameworkCore;

public class UserBridge : BaseBridge<User>
{
  private readonly ApplicationDbContext _context;

    public UserBridge(ApplicationDbContext context)
    {
        _context = context;
    }
    public override async Task<List<User>> GetAsync(int id)
    {
        return await _context.Users.ToListAsync();
    }

    public override async Task AddAsync(User user)
    {
     
    }

    public override async Task SetAsync(User user)
    {
     
    }

    public override async Task RemoveAsync(int id)
    {
    }
}
