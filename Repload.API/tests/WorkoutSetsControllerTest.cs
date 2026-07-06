using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Repload.API.Controllers;
using Repload.API.Data;
using Repload.API.DTOs;
using Repload.API.Models;
using System.Security.Claims;
using Xunit;

namespace Repload.API.Tests
{
    public class WorkoutSetsControllerTest
    {
        private ReploadDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ReploadDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ReploadDbContext(options);
        }

        private WorkoutSetsController GetController(ReploadDbContext context)
        {
            var controller = new WorkoutSetsController(context);

            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "1")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = user
                }
            };

            return controller;
        }


        [Fact]
        public async Task AddSet_ReturnsOkResult()
        {
            var context = GetDbContext();

            context.Users.Add(new User { Id = 1, Username = "test" });
            context.Exercises.Add(new Exercise { Id = 1, Name = "Bench" });
            context.Workouts.Add(new Workout { Id = 1, UserId = 1, Name = "Workout 1" });
            await context.SaveChangesAsync();

            var controller = GetController(context);

            var dto = new CreateWorkoutSetDto
            {
                ExerciseId = 1,
                Reps = 10,
                Weight = 100,
                SetNumber = 1
            };

            var result = await controller.AddSet(1, dto);

            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
        }
        [Fact]
        public async Task GetSets_ReturnsOkResult()
        {
            var context = GetDbContext();

            context.Users.Add(new User { Id = 1 });
            context.Exercises.Add(new Exercise { Id = 1, Name = "Bench" });
            context.Workouts.Add(new Workout { Id = 1, UserId = 1 });

            context.WorkoutSets.Add(new WorkoutSet
            {
                Id = 1,
                WorkoutId = 1,
                ExerciseId = 1,
                Reps = 10,
                Weight = 100,
                SetNumber = 1
            });

            await context.SaveChangesAsync();

            var controller = GetController(context);

            var result = await controller.GetSets(1);

            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
        }
        [Fact]
        public async Task ReplaceSets_ReturnsOkResult()
        {
            var context = GetDbContext();

            context.Users.Add(new User { Id = 1 });
            context.Exercises.Add(new Exercise { Id = 1, Name = "Bench" });
            context.Workouts.Add(new Workout { Id = 1, UserId = 1 });

            await context.SaveChangesAsync();

            var controller = GetController(context);

            var dtoList = new List<CreateWorkoutSetDto>
            {
                new CreateWorkoutSetDto
                {
                    ExerciseId = 1,
                    Reps = 8,
                    Weight = 80,
                    SetNumber = 1
                }
            };

            var result = await controller.ReplaceSets(1, dtoList);

            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
        }
        
        [Fact]
        public async Task GetWorkoutFull_ReturnsOkResult()
        {
            var context = GetDbContext();

            context.Users.Add(new User { Id = 1 });
            context.Exercises.Add(new Exercise { Id = 1, Name = "Bench" });

            context.Workouts.Add(new Workout
            {
                Id = 1,
                UserId = 1,
                Name = "Workout"
            });

            context.WorkoutSets.Add(new WorkoutSet
            {
                Id = 1,
                WorkoutId = 1,
                ExerciseId = 1,
                Reps = 10,
                Weight = 100,
                SetNumber = 1
            });

            await context.SaveChangesAsync();

            var controller = GetController(context);

            var result = await controller.GetWorkoutFull(1);

            Assert.NotNull(result);
            Assert.IsType<OkObjectResult>(result);
        }
    }
}