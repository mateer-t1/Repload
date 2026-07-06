using Repload.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Repload.API.Data
{
    public class ReploadDbContext : DbContext
    {
        public ReploadDbContext(DbContextOptions<ReploadDbContext> options)
            : base(options)
        {
        }

        // USERS 
        public DbSet<User> Users { get; set; }

        public DbSet<Workout> Workouts { get; set; } // logged workouts
        public DbSet<WorkoutSet> WorkoutSets { get; set; }

        // EXERCISES
        public DbSet<Exercise> Exercises { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Workouts)
                .WithOne(w => w.User)
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Workout>()
                .HasMany(w => w.Sets)
                .WithOne(s => s.Workout)
                .HasForeignKey(s => s.WorkoutId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Exercise>()
                .HasMany(e => e.Sets)
                .WithOne(s => s.Exercise)
                .HasForeignKey(s => s.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}