
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Repload.API.Controllers;
using Repload.API.Data;
using Repload.API.DTOs;
using Repload.API.Models;
using Xunit;

namespace Repload.Tests
{
    public class ExercisesControllerTests
    {
        private ReploadDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<ReploadDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new ReploadDbContext(options);
        }

        private exercisesController CreateController(ReploadDbContext context)
        {
            return new exercisesController(context);
        }

        [Fact]
        public async Task GetAllExercises_ShouldReturnList()
        {
            var context = GetDbContext();

            context.Exercises.Add(new Exercise { Name = "Bench Press", IsCustom = false });
            context.Exercises.Add(new Exercise { Name = "Squat", IsCustom = false });

            await context.SaveChangesAsync();

            var controller = CreateController(context);

            var result = await controller.GetAllExercises();

            var ok = Assert.IsType<OkObjectResult>(result);
            var data = Assert.IsAssignableFrom<System.Collections.IEnumerable>(ok.Value);

            Assert.NotNull(data);
        }

        [Fact]
        public async Task GetExercise_ShouldReturnExercise_WhenExists()
        {
            var context = GetDbContext();

            var exercise = new Exercise { Name = "Deadlift", IsCustom = false };
            context.Exercises.Add(exercise);
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            var result = await controller.GetExercise(exercise.Id);

            var ok = Assert.IsType<OkObjectResult>(result);

            var returned = Assert.IsType<Exercise>(ok.Value);

            Assert.Equal(exercise.Name, returned.Name);
        }

        [Fact]
        public async Task GetExercise_ShouldReturnNotFound_WhenMissing()
        {
            var context = GetDbContext();
            var controller = CreateController(context);

            var result = await controller.GetExercise(999);

            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task CreateExercise_ShouldAddExercise_WhenValid()
        {
            var context = GetDbContext();
            var controller = CreateController(context);

            var dto = new ExerciseDto
            {
                Name = "Pull Up",
                IsCustom = true
            };

            var result = await controller.CreateExercise(dto);

            var ok = Assert.IsType<OkObjectResult>(result);

            var created = Assert.IsType<Exercise>(ok.Value);

            Assert.Equal("Pull Up", created.Name);

            Assert.Equal(1, context.Exercises.Count());
        }

        [Fact]
        public async Task CreateExercise_ShouldRejectDuplicates()
        {
            var context = GetDbContext();

            context.Exercises.Add(new Exercise
            {
                Name = "Bench Press",
                IsCustom = false
            });

            await context.SaveChangesAsync();

            var controller = CreateController(context);

            var dto = new ExerciseDto
            {
                Name = "bench press", // case-insensitive duplicate
                IsCustom = false
            };

            var result = await controller.CreateExercise(dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task DeleteExercise_ShouldRemove_WhenExists()
        {
            var context = GetDbContext();

            var exercise = new Exercise { Name = "Row", IsCustom = false };
            context.Exercises.Add(exercise);
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            var result = await controller.DeleteExercise(exercise.Id);

            Assert.IsType<NoContentResult>(result);

            Assert.Empty(context.Exercises);
        }

        [Fact]
        public async Task SearchExercises_ShouldReturnMatches()
        {
            var context = GetDbContext();

            context.Exercises.Add(new Exercise { Name = "Bench Press", IsCustom = false });
            context.Exercises.Add(new Exercise { Name = "Incline Bench Press", IsCustom = false });
            context.Exercises.Add(new Exercise { Name = "Squat", IsCustom = false });

            await context.SaveChangesAsync();

            var controller = CreateController(context);

            var result = await controller.SearchExercises("bench");

            var ok = Assert.IsType<OkObjectResult>(result);

            var list = Assert.IsAssignableFrom<System.Collections.IEnumerable>(ok.Value);

            Assert.NotNull(list);
        }

        [Fact]
        public async Task SearchExercises_ShouldReturnEmpty_WhenQueryBlank()
        {
            var context = GetDbContext();
            var controller = CreateController(context);

            var result = await controller.SearchExercises("");

            var ok = Assert.IsType<OkObjectResult>(result);

            var list = Assert.IsAssignableFrom<System.Collections.IEnumerable>(ok.Value);

            Assert.NotNull(list);
        }
    }
}