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
    public class DashboardControllerTests
    {
        private ReploadDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ReploadDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ReploadDbContext(options);
        }

        private DashboardController CreateController(ReploadDbContext context, int userId = 1)
        {
            var controller = new DashboardController(context);

            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Name, "testuser")
            }, "mock"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            return controller;
        }

        [Fact]
        public async Task GetDashboard_ShouldReturnOk_WithEmptyData()
        {
            var context = GetDbContext();
            var controller = CreateController(context);

            var result = await controller.GetDashboard();

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(ok.Value);
        }

        [Fact]
        public async Task GetDashboard_ShouldCalculateWeeklyStats()
        {
            var context = GetDbContext();

            var user = new User
            {
                Email = "test@test.com",
                Username = "test",
                PasswordHash = "x"
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();

            var workout = new Workout
            {
                Name = "Push Day",
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow
            };

            context.Workouts.Add(workout);
            await context.SaveChangesAsync();

            context.WorkoutSets.Add(new WorkoutSet
            {
                WorkoutId = workout.Id,
                ExerciseId = 1,
                Reps = 10,
                Weight = 50
            });

            await context.SaveChangesAsync();

            var controller = CreateController(context, user.Id);

            var result = await controller.GetDashboard();

            var ok = Assert.IsType<OkObjectResult>(result);

            Assert.NotNull(ok.Value);
        }

        [Fact]
        public async Task GetDashboard_ShouldReturnUnauthorized_WhenUserIdMissing()
        {
            var context = GetDbContext();

            var controller = new DashboardController(context);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            var result = await controller.GetDashboard();

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.NotNull(unauthorized.Value);
        }
    }
}