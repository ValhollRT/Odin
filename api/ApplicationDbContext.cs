using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<User>(entity =>
    {
        entity.ToTable("users");
        entity.Property(e => e.Id).HasColumnName("id");
        entity.Property(e => e.Username).HasColumnName("username");
        entity.Property(e => e.Password).HasColumnName("password");
        entity.Property(e => e.CreatedAt).HasColumnName("createdat");
    });
}
}
