using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BCrypt.Net;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

using Repload.API.Controllers;
using Repload.API.Data;
using Repload.API.DTOs;
using Repload.API.Models;
using Repload.API.Services;

namespace Repload.Tests
{
    public class AuthControllerTests
    {
        private ReploadDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ReploadDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ReploadDbContext(options);
        }

        private Mock<IJwtService> GetJwtServiceMock()
        {
            var mock = new Mock<IJwtService>();

            mock.Setup(x => x.CreateToken(It.IsAny<User>()))
                .Returns("fake-jwt-token");

            return mock;
        }

        [Fact]
        public async Task Register_ShouldReturnToken_WhenUserIsNew()
        {
            var context = GetDbContext();
            var jwtMock = GetJwtServiceMock();

            var controller = new AuthController(context, jwtMock.Object);

            var dto = new RegisterDto
            {
                Email = "test@test.com",
                Username = "testuser",
                Password = "Password123!"
            };

            var result = await controller.Register(dto);

            var okResult = Assert.IsType<OkObjectResult>(result);
            dynamic value = okResult.Value;

            Assert.NotNull(value);
            Assert.Equal("fake-jwt-token", (string)value.token);
        }

        [Fact]
        public async Task Register_ShouldReturnBadRequest_WhenUserExists()
        {
            var context = GetDbContext();
            var jwtMock = GetJwtServiceMock();

            context.Users.Add(new User
            {
                Email = "test@test.com",
                Username = "existing",
                PasswordHash = "hash"
            });

            await context.SaveChangesAsync();

            var controller = new AuthController(context, jwtMock.Object);

            var dto = new RegisterDto
            {
                Email = "test@test.com",
                Username = "newuser",
                Password = "Password123!"
            };

            var result = await controller.Register(dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Login_ShouldReturnToken_WhenCredentialsAreValid()
        {
            var context = GetDbContext();
            var jwtMock = GetJwtServiceMock();

            var password = "Password123!";
            var hash = BCrypt.Net.BCrypt.HashPassword(password);

            context.Users.Add(new User
            {
                Email = "test@test.com",
                Username = "testuser",
                PasswordHash = hash
            });

            await context.SaveChangesAsync();

            var controller = new AuthController(context, jwtMock.Object);

            var dto = new LoginDto
            {
                Email = "test@test.com",
                Password = password
            };

            var result = await controller.Login(dto);

            var okResult = Assert.IsType<OkObjectResult>(result);
            dynamic value = okResult.Value;

            Assert.NotNull(value);
            Assert.Equal("fake-jwt-token", (string)value.token);
        }

        [Fact]
        public async Task Login_ShouldReturnUnauthorized_WhenPasswordIsWrong()
        {
            var context = GetDbContext();
            var jwtMock = GetJwtServiceMock();

            context.Users.Add(new User
            {
                Email = "test@test.com",
                Username = "testuser",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("correct")
            });

            await context.SaveChangesAsync();

            var controller = new AuthController(context, jwtMock.Object);

            var dto = new LoginDto
            {
                Email = "test@test.com",
                Password = "wrong"
            };

            var result = await controller.Login(dto);

            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task GetUsers_ShouldReturnAllUsers()
        {
            var context = GetDbContext();
            var jwtMock = GetJwtServiceMock();

            context.Users.Add(new User { Email = "a@test.com", Username = "A", PasswordHash = "x" });
            context.Users.Add(new User { Email = "b@test.com", Username = "B", PasswordHash = "x" });

            await context.SaveChangesAsync();

            var controller = new AuthController(context, jwtMock.Object);

            var result = await controller.GetUsers();

            var okResult = Assert.IsType<OkObjectResult>(result);

            var users = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);

            users.Count().Should().Be(2);
        }

        [Fact]
        public async Task GetUser_ShouldReturnUser_WhenExists()
        {
            var context = GetDbContext();
            var jwtMock = GetJwtServiceMock();

            var user = new User
            {
                Email = "test@test.com",
                Username = "testuser",
                PasswordHash = "x"
            };

            context.Users.Add(user);
            await context.SaveChangesAsync();

            var controller = new AuthController(context, jwtMock.Object);

            var result = await controller.GetUser(user.Id);

            var okResult = Assert.IsType<OkObjectResult>(result);
            dynamic returnedUser = okResult.Value;

            Assert.Equal(user.Id, (int)returnedUser.Id);
            Assert.Equal(user.Username, (string)returnedUser.Username);
            Assert.Equal(user.Email, (string)returnedUser.Email);
        }

        [Fact]
        public async Task GetUser_ShouldReturnNotFound_WhenMissing()
        {
            var context = GetDbContext();
            var jwtMock = GetJwtServiceMock();

            var controller = new AuthController(context, jwtMock.Object);

            var result = await controller.GetUser(999);

            Assert.IsType<NotFoundResult>(result);
        }
    }
}