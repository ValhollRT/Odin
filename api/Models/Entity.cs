using System.ComponentModel.DataAnnotations;

public abstract class Entity
{
    [Key]
    public int Id { get; set; }
}