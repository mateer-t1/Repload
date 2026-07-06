using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Repload.API.Data;
using Repload.API.DTOs;
using Repload.API.Models;

namespace Repload.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class exercisesController : ControllerBase
    {
        private readonly ReploadDbContext _context;

        public exercisesController(ReploadDbContext context)
        {
            _context = context;
        }

        // GET: api/exercises
        [HttpGet]
        public async Task<IActionResult> GetAllExercises()
        {
            var exercises = await _context.Exercises
                .OrderBy(e => e.Name)
                .ToListAsync();

            return Ok(exercises);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetExercise(int id)
        {
            var exercise = await _context.Exercises
                .FirstOrDefaultAsync(e => e.Id == id);

            if (exercise == null)
                return NotFound("Exercise not found");

            return Ok(exercise);
        }

        [HttpPost]
        public async Task<IActionResult> CreateExercise(ExerciseDto dto)
        {
            // prevent duplicates (important for clean dataset)
            var exists = await _context.Exercises
                .AnyAsync(e => e.Name.ToLower() == dto.Name.ToLower());

            if (exists)
                return BadRequest("Exercise already exists");

            var exercise = new Exercise
            {
                Name = dto.Name,
                IsCustom = dto.IsCustom
            };

            _context.Exercises.Add(exercise);
            await _context.SaveChangesAsync();

            return Ok(exercise);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExercise(int id)
        {
            var exercise = await _context.Exercises.FindAsync(id);

            if (exercise == null)
                return NotFound("Exercise not found");

            _context.Exercises.Remove(exercise);
            await _context.SaveChangesAsync();

            return NoContent();
        }
       [HttpGet("search")]
public async Task<IActionResult> SearchExercises(string query)
{
    if (string.IsNullOrWhiteSpace(query))
        return Ok(new List<ExerciseDto>());

    query = query.Trim().ToLower();

    var results = await _context.Exercises
        .Where(e => e.Name.ToLower().Contains(query))
        .Select(e => new ExerciseDto
        {
            Id = e.Id,
            Name = e.Name,
            IsCustom = e.IsCustom
        })
        .ToListAsync();

    var ordered = results
        .OrderBy(e =>
        {
            var name = e.Name.ToLower();

            if (name == query) return 0;                
            if (name.StartsWith(query)) return 1;        
            if (name.Contains(query)) return 2;          
            return 3;
        })
        .ThenBy(e => e.Name)
        .Take(10)
        .ToList();

    return Ok(ordered);
}
    }
}