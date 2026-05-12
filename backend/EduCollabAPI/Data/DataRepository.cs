using System.Linq.Expressions;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using EduCollabAPI.Data;

namespace EduCollabAPI.Data
{
    public class DataRepository<T> where T : class
    {
        private readonly AppDbContext _db;
        private readonly DbSet<T> _table;

        public DataRepository(AppDbContext db)
        {
            _db = db;
            _table = _db.Set<T>();
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _table.ToListAsync();
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            return await _table.FindAsync(id);
        }

        public async Task AddAsync(T entity)
        {
            _table.Add(entity);
            await _db.SaveChangesAsync();
        }

        public async Task UpdateAsync(T entity)
        {
            _db.Entry(entity).State = EntityState.Modified;
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(T entity)
        {
            _table.Remove(entity);
            await _db.SaveChangesAsync();
        }

        public async Task<IEnumerable<T>> GetAllAsyncInclude(Expression<Func<T, bool>>? criteria, params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _table;

            if (includes != null)
            {
                query = includes.Aggregate(query, (current, include) => current.Include(include));
            }

            if (criteria != null)
            {
                query = query.Where(criteria);
            }

            return await query.ToListAsync();
        }

        public async Task<T?> GetOneAsyncInclude(Expression<Func<T, bool>> criteria, params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _table;

            if (includes != null)
            {
                query = includes.Aggregate(query, (current, include) => current.Include(include));
            }

            return await query.FirstOrDefaultAsync(criteria);
        }


    }
}
