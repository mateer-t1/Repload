using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Repload.API.Controllers;
using Repload.API.Data;
using Repload.API.Models;
using Xunit;

namespace Repload.Tests
{
    public class UsersControllerTests
    {
        private ReploadDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ReploadDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ReploadDbContext(options);
        }

        private UsersController CreateController(ReploadDbContext context)
        {
            return new UsersController(context);
        }

        [Fact]
        public async Task GetAllUsers_ShouldReturnUsersList()
        {
            var context = GetDbContext();

            context.Users.Add(new User
            {
                Username = "user1",
                Email = "user1@test.com",
                PasswordHash = "x"
            });

            context.Users.Add(new User
            {
                Username = "user2",
                Email = "user2@test.com",
                PasswordHash = "x"
            });

            await context.SaveChangesAsync();

            var controller = CreateController(context);

            var result = await controller.GetAllUsers();

            var ok = Assert.IsType<OkObjectResult>(result);

            var list = Assert.IsAssignableFrom<System.Collections.IEnumerable>(ok.Value);

            Assert.NotNull(list);
        }

        [Fact]
        public async Task GetUser_ShouldReturnUser_WhenExists()
        {
            var context = GetDbContext();

            var user = new User
            {
                Username = "testuser",
                Email = "test@test.com",
                PasswordHash = "x"
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            var result = await controller.GetUser(user.Id);

            var ok = Assert.IsType<OkObjectResult>(result);

            Assert.NotNull(ok.Value);
        }

        [Fact]
        public async Task GetUser_ShouldReturnNotFound_WhenMissing()
        {
            var context = GetDbContext();
            var controller = CreateController(context);

            var result = await controller.GetUser(999);

            Assert.IsType<NotFoundResult>(result);
        }
    }
}