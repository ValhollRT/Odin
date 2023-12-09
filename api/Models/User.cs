using System.ComponentModel.DataAnnotations;

public class User : Entity
{
    public string? Username { get; set; }
    public string? Password { get; set; }
    public DateTime? CreatedAt { get; set; }
}
