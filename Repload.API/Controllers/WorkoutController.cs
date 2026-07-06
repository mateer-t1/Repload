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
    public class WorkoutController : ControllerBase
    {
        private readonly ReploadDbContext _context;

        public WorkoutController(ReploadDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateWorkout(WorkoutCreateDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { message = "User ID claim missing" });

            var userId = int.Parse(userIdClaim);

            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
                return BadRequest(new { message = "User does not exist in database" });

            var workout = new Workout
            {
                Name = dto.Name,
                UserId = userId,
                CreatedAt = dto.WorkoutDate ?? DateTime.UtcNow
            };

            _context.Workouts.Add(workout);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                workout.Id,
                workout.Name,
                workout.UserId,
                workout.CreatedAt
            });
        }

        [HttpPost("full")]
        public async Task<IActionResult> CreateFullWorkout(CreateWorkoutFullDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { message = "User ID claim missing" });

            var userId = int.Parse(userIdClaim);

            var workout = new Workout
            {
                Name = dto.Name,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Workouts.Add(workout);
            await _context.SaveChangesAsync();

            foreach (var ex in dto.Exercises)
            {
                for (int i = 0; i < ex.Sets.Count; i++)
                {
                    var set = ex.Sets[i];

                    var workoutSet = new WorkoutSet
                    {
                        WorkoutId = workout.Id,
                        ExerciseId = ex.ExerciseId,
                        Reps = set.Reps,
                        Weight = set.Weight,
                        SetNumber = i + 1
                    };

                    _context.WorkoutSets.Add(workoutSet);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                workout.Id,
                workout.Name,
                workout.UserId,
                workout.CreatedAt
            });
        }

        [HttpGet("{id}/full")]
public async Task<IActionResult> GetWorkoutFull(int id)
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrEmpty(userIdClaim))
        return Unauthorized();

    var userId = int.Parse(userIdClaim);

    var workout = await _context.Workouts
        .AsNoTracking()
        .Where(w => w.Id == id && w.UserId == userId)
        .Select(w => new WorkoutFullDto
        {
            Id = w.Id,
            Name = w.Name,
            CreatedAt = w.CreatedAt,

            Sets = _context.WorkoutSets
                .Where(s => s.WorkoutId == w.Id)
                .Join(
                    _context.Exercises,
                    s => s.ExerciseId,
                    e => e.Id,
                    (s, e) => new WorkoutSetDto
                    {
                        Id = s.Id,
                        ExerciseId = s.ExerciseId,
                        ExerciseName = e.Name,
                        Reps = s.Reps,
                        Weight = s.Weight,
                        SetNumber = s.SetNumber
                    }
                )
                .ToList()
        })
        .FirstOrDefaultAsync();

    if (workout == null)
        return NotFound();

    return Ok(workout);
}

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkout(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized(new { message = "User ID claim missing" });

            var userId = int.Parse(userIdClaim);

            var workout = await _context.Workouts
                .FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

            if (workout == null)
                return NotFound(new { message = "Workout not found" });

            _context.Workouts.Remove(workout);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Workout deleted successfully" });
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyWorkouts()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User ID claim missing");

            var userId = int.Parse(userIdClaim);

            var workouts = await _context.Workouts
                .AsNoTracking()
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.CreatedAt)
                .Select(w => new WorkoutResponseDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    UserId = w.UserId,
                    CreatedAt = w.CreatedAt
                })
                .ToListAsync();

            return Ok(workouts);
        }
    }
}