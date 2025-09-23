using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Linq.Expressions;

namespace Workflow.Shared.Data.Banco
{
    public class DAL <T> where T :class
    {
        private readonly WorkflowDbContext _context;

        public DAL(WorkflowDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<T>> ListarTodos()
        {
            return await _context.Set<T>().ToListAsync();
        }

        public async Task<IEnumerable<T>> ListarComInclude(Expression<Func<T, object>> include)
        {
            return await _context.Set<T>().Include(include).ToListAsync();
        }

        public async Task Adicionar(T entity)
        {
            await _context.Set<T>().AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task Atualizar(T entity)
        {
            _context.Set<T>().Update(entity);
            await _context.SaveChangesAsync();
        }   

        public async Task Deletar(T entity)
        {
            _context.Set<T>().Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<T?> RecuperarPor(Expression<Func<T, bool>> condicao)
        {
            return await _context.Set<T>().FirstOrDefaultAsync(condicao);
        }

        public async Task<IEnumerable<T>> ListarPor(Expression<Func<T, bool>> condicao)
        {
            return await _context.Set<T>().Where(condicao).ToListAsync();
        }
    }
}
