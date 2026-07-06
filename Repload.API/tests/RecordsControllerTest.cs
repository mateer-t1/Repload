using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Repload.API.Controllers;
using Repload.API.Data;
using Repload.API.Models;
using Xunit;

namespace Repload.Tests
{
    public class RecordsControllerTests
    {
        private ReploadDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ReploadDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ReploadDbContext(options);
        }

        private RecordsController CreateController(ReploadDbContext context, int userId = 1)
        {
            var controller = new RecordsController(context);

            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
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
        public async Task Get_ShouldReturnUnauthorized_WhenNoUserId()
        {
            var context = GetDbContext();

            var controller = new RecordsController(context);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var result = await controller.Get();

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.NotNull(unauthorized.Value);
        }

        [Fact]
        public async Task Get_ShouldReturnEmptyRecords_WhenNoWorkouts()
        {
            var context = GetDbContext();
            var controller = CreateController(context, 1);

            var result = await controller.Get();

            var ok = Assert.IsType<OkObjectResult>(result);

            Assert.NotNull(ok.Value);
        }

        [Fact]
        public async Task Get_ShouldReturnMappedRecords_WhenDataExists()
        {
            var context = GetDbContext();

            var userId = 1;

            var workout = new Workout
            {
                UserId = userId,
                Name = "Push Day",
                CreatedAt = DateTime.UtcNow
            };

            context.Workouts.Add(workout);
            await context.SaveChangesAsync();

            context.WorkoutSets.Add(new WorkoutSet
            {
                WorkoutId = workout.Id,
                ExerciseId = 1,
                Weight = 100,
                Reps = 5
            });

            await context.SaveChangesAsync();

            var controller = CreateController(context, userId);

            var result = await controller.Get();

            var ok = Assert.IsType<OkObjectResult>(result);

            Assert.NotNull(ok.Value);
        }
    }
}