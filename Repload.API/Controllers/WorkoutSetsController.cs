using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Repload.API.Data;
using Repload.API.DTOs;
using Repload.API.Models;
using System.Security.Claims;

namespace Repload.API.Controllers
{
    [ApiController]
    [Route("api/workouts")]
    [Authorize]
    public class WorkoutSetsController : ControllerBase
    {
        private readonly ReploadDbContext _context;

        public WorkoutSetsController(ReploadDbContext context)
        {
            _context = context;
        }

        [HttpPost("{workoutId}/sets")]
        public async Task<IActionResult> AddSet(int workoutId, [FromBody] CreateWorkoutSetDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var workoutExists = await _context.Workouts
                .AnyAsync(w => w.Id == workoutId && w.UserId == userId);

            if (!workoutExists)
                return NotFound("Workout not found or access denied");

            var exerciseExists = await _context.Exercises
                .AnyAsync(e => e.Id == dto.ExerciseId);

            if (!exerciseExists)
                return NotFound("Exercise not found");

            var set = new WorkoutSet
            {
                WorkoutId = workoutId,
                ExerciseId = dto.ExerciseId,
                Reps = dto.Reps,
                Weight = dto.Weight,
                SetNumber = dto.SetNumber
            };

            _context.WorkoutSets.Add(set);
            await _context.SaveChangesAsync();

            return Ok(new { id = set.Id });
        }

        [HttpPut("{workoutId}/sets")]
        public async Task<IActionResult> ReplaceSets(int workoutId, [FromBody] List<CreateWorkoutSetDto> dtos)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var workout = await _context.Workouts
                .Include(w => w.Sets)
                .FirstOrDefaultAsync(w => w.Id == workoutId && w.UserId == userId);

            if (workout == null)
                return NotFound("Workout not found or access denied");

            // DELETE ALL EXISTING SETS
            _context.WorkoutSets.RemoveRange(workout.Sets);

            // ADD NEW SETS
            var newSetsList = dtos.Select((dto, index) => new WorkoutSet
            {
                WorkoutId = workoutId,
                ExerciseId = dto.ExerciseId,
                Reps = dto.Reps,
                Weight = dto.Weight,
                SetNumber = dto.SetNumber > 0 ? dto.SetNumber : index + 1
            }).ToList();

            _context.WorkoutSets.AddRange(newSetsList);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Workout updated successfully",
                count = newSetsList.Count
            });
        }

        [HttpGet("{workoutId}/sets")]
        public async Task<IActionResult> GetSets(int workoutId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var sets = await _context.WorkoutSets
                .Where(s => s.WorkoutId == workoutId &&
                            s.Workout.UserId == userId)
                .Select(s => new WorkoutSetDto
                {
                    Id = s.Id,
                    ExerciseId = s.ExerciseId,
                    ExerciseName = s.Exercise.Name,
                    Reps = s.Reps,
                    Weight = s.Weight,
                    SetNumber = s.SetNumber
                })
                .ToListAsync();

            return Ok(sets);
        }

        [HttpGet("{id}/sets")]
        public async Task<IActionResult> GetWorkoutFull(int workoutId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var workout = await _context.Workouts
                .Include(w => w.Sets)
                    .ThenInclude(s => s.Exercise)
                .FirstOrDefaultAsync(w => w.Id == workoutId && w.UserId == userId);

            if (workout == null)
                return NotFound("Workout not found");

            return Ok(new WorkoutFullDto
            {
                Id = workout.Id,
                Name = workout.Name,
                CreatedAt = workout.CreatedAt,
                Sets = workout.Sets.Select(s => new WorkoutSetDto
                {
                    Id = s.Id,
                    ExerciseId = s.ExerciseId,
                    ExerciseName = s.Exercise?.Name ?? "",
                    Reps = s.Reps,
                    Weight = s.Weight,
                    SetNumber = s.SetNumber
                }).ToList()
            });
        }
    }
}