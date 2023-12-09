public abstract class BaseBridge<T> where T : Entity
{
    public virtual Task<List<T>> GetAsync(int id)
    {
        return (Task<List<T>>)Task.CompletedTask;
    }

    public virtual Task AddAsync(T entity)
    {
        return Task.CompletedTask;
    }

    public virtual Task SetAsync(T entity)
    {
        return Task.CompletedTask;
    }

    public virtual Task RemoveAsync(int id)
    {
        return Task.CompletedTask;
    }
}