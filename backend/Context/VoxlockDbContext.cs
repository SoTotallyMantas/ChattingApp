using Microsoft.EntityFrameworkCore;

namespace backend.Context

{
    public class VoxlockDbContext : DbContext
    {
        public VoxlockDbContext(DbContextOptions<VoxlockDbContext> options) : base(options) 
        { 
        }


    }
}
