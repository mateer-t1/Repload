using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Repload.API.Controllers;
using Repload.API.Data;
using Repload.API.DTOs;
using Repload.API.Models;
using System.Security.Claims;
using Xunit;

namespace Repload.Tests
{
    public class WorkoutControllerTests
    {
        private ReploadDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ReploadDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ReploadDbContext(options);
        }

        private static ControllerContext GetUserContext(int userId)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            };

            var identity = new ClaimsIdentity(claims, "TestAuth");

            return new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(identity)
                }
            };
        }

        private static void Seed(ReploadDbContext context, int userId)
        {
            context.Users.Add(new User
            {
                Id = userId,
                Email = "test@test.com",
                Username = "test",
                PasswordHash = "x"
            });

            context.Workouts.Add(new Workout
            {
                Id = 1,
                Name = "Push Day",
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            });

            context.Exercises.Add(new Exercise
            {
                Id = 1,
                Name = "Bench Press",
                IsCustom = false
            });

            context.WorkoutSets.Add(new WorkoutSet
            {
                Id = 1,
                WorkoutId = 1,
                ExerciseId = 1,
                Reps = 10,
                Weight = 80,
                SetNumber = 1
            });

            context.SaveChanges();
        }

        [Fact]
        public async Task CreateWorkout_ShouldReturnOk()
        {
            var context = GetDbContext();
            var userId = 1;

            Seed(context, userId);

            var controller = new WorkoutController(context)
            {
                ControllerContext = GetUserContext(userId)
            };

            var dto = new WorkoutCreateDto
            {
                Name = "Leg Day",
                WorkoutDate = DateTime.UtcNow
            };

            var result = await controller.CreateWorkout(dto);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetWorkoutFull_ShouldReturnOk()
        {
            var context = GetDbContext();
            var userId = 1;

            Seed(context, userId);

            var controller = new WorkoutController(context)
            {
                ControllerContext = GetUserContext(userId)
            };

            var result = await controller.GetWorkoutFull(1);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task DeleteWorkout_ShouldReturnOk_AndRemoveWorkout()
        {
            var context = GetDbContext();
            var userId = 1;

            Seed(context, userId);

            var controller = new WorkoutController(context)
            {
                ControllerContext = GetUserContext(userId)
            };

            var result = await controller.DeleteWorkout(1);

            Assert.IsType<OkObjectResult>(result);

            var exists = await context.Workouts.AnyAsync(x => x.Id == 1);
            Assert.False(exists);
        }

        [Fact]
        public async Task GetMyWorkouts_ShouldReturnOk()
        {
            var context = GetDbContext();
            var userId = 1;

            Seed(context, userId);

            var controller = new WorkoutController(context)
            {
                ControllerContext = GetUserContext(userId)
            };

            var result = await controller.GetMyWorkouts();

            Assert.IsType<OkObjectResult>(result);
        }
    }
}