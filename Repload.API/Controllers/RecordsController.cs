using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Repload.API.Data;
using System.Security.Claims;

namespace Repload.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] 
public class RecordsController : ControllerBase
{
    private readonly ReploadDbContext _context;

    public RecordsController(ReploadDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized("Invalid or missing user id claim.");
        }

        var sets = await _context.Workouts
            .Where(w => w.UserId == userId)
            .Include(w => w.Sets)
                .ThenInclude(s => s.Exercise)
            .SelectMany(w => w.Sets.Select(s => new
            {
                lift = s.Exercise.Name,
                weight = s.Weight,
                reps = s.Reps,
                date = w.CreatedAt
            }))
            .OrderByDescending(x => x.date)
            .ToListAsync();

        return Ok(new
        {
            records = sets
        });
    }
}