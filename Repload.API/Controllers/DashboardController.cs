    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Repload.API.Data;
    using Repload.API.DTOs;
    using System.Security.Claims;

    namespace Repload.API.Controllers
    {
        [ApiController]
        [Route("api/[controller]")]
        [Authorize]
        public class DashboardController : ControllerBase
        {
            private readonly ReploadDbContext _context;

            public DashboardController(ReploadDbContext context)
            {
                _context = context;
            }

            [HttpGet]
            public async Task<IActionResult> GetDashboard()
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (!int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new
                    {
                        error = "Invalid or missing authentication token"
                    });
                }

                var username = User.FindFirst(ClaimTypes.Name)?.Value ?? "Athlete";

                var workouts = await _context.Workouts
                    .Include(w => w.Sets)
                        .ThenInclude(s => s.Exercise)
                    .Where(w => w.UserId == userId)
                    .OrderByDescending(w => w.CreatedAt)
                    .ToListAsync();

                var today = DateTime.UtcNow.Date;
                var daysFromMonday = ((int)today.DayOfWeek + 6) % 7;
                var weekStart = today.AddDays(-daysFromMonday);
                var weekEnd = weekStart.AddDays(7);
                var lastWeekStart = weekStart.AddDays(-7);

                var thisWeek = workouts
                    .Where(w => w.CreatedAt >= weekStart && w.CreatedAt < weekEnd)
                    .ToList();

                var lastWeek = workouts
                    .Where(w => w.CreatedAt >= lastWeekStart && w.CreatedAt < weekStart)
                    .ToList();

                var thisWeekSets = thisWeek.SelectMany(w => w.Sets).ToList();

                var lastWeekVolume = lastWeek
                    .SelectMany(w => w.Sets)
                    .Sum(s => s.Weight * s.Reps);

                var thisWeekVolume = (int)thisWeekSets
                    .Sum(s => s.Weight * s.Reps);

                string? volumeChange = null;

                if (lastWeekVolume > 0)
                {
                    var pct = ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100;
                    volumeChange = $"{(pct >= 0 ? "+" : "")}{pct:F1}%";
                }
                else if (thisWeekVolume > 0)
                {
                    volumeChange = "New week";
                }

                var dayLabels = new[] { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };
                var weekVolume = new List<DashboardWeekVolumeDto>();

                for (var i = 0; i < 7; i++)
                {
                    var day = weekStart.AddDays(i);

                    var dayWorkouts = thisWeek
                        .Where(w => w.CreatedAt.Date == day)
                        .ToList();

                    var dayVolume = (int)dayWorkouts
                        .SelectMany(w => w.Sets)
                        .Sum(s => s.Weight * s.Reps);

                    var label = dayWorkouts.Count > 0
                        ? dayWorkouts[0].Name
                        : dayVolume > 0 ? "Session" : "Rest";

                    weekVolume.Add(new DashboardWeekVolumeDto
                    {
                        Day = dayLabels[i],
                        Volume = dayVolume,
                        Label = label
                    });
                }

                var exerciseSetGroups = thisWeekSets
                    .GroupBy(s => s.Exercise?.Name ?? "Unknown")
                    .Select(g => new DashboardExerciseSetsDto
                    {
                        Name = g.Key,
                        Sets = g.Count()
                    })
                    .OrderByDescending(g => g.Sets)
                    .Take(6)
                    .ToList();

                var maxExerciseSets = exerciseSetGroups.FirstOrDefault()?.Sets ?? 1;

                foreach (var group in exerciseSetGroups)
                {
                    group.Target = maxExerciseSets;
                }

                var recentSessions = workouts
                    .Take(4)
                    .Select(w => new DashboardSessionDto
                    {
                        Day = FormatSessionDay(w),
                        Title = w.Name,
                        Duration = w.Sets.Count > 0 ? $"{w.Sets.Count} sets" : "No sets",
                        Volume = (int)w.Sets.Sum(s => s.Weight * s.Reps),
                        Prs = 0,
                        Exercises = FormatTopExercises(w.Sets)
                    })
                    .ToList();

                var allSets = workouts.SelectMany(w => w.Sets).ToList();

                var records = allSets
                    .GroupBy(s => s.Exercise?.Name ?? "Unknown")
                    .Select(g =>
                    {
                        var best = g.OrderByDescending(s => s.Weight).FirstOrDefault();

                        var previous = g
                            .Where(s => best != null && s.Id != best.Id)
                            .OrderByDescending(s => s.Weight)
                            .FirstOrDefault();

                        var delta = (best != null && previous != null)
                            ? $"+{(best.Weight - previous.Weight):0.#}"
                            : "—";

                        return new DashboardRecordDto
                        {
                            Lift = g.Key,
                            Weight = best != null ? $"{best.Weight} kg" : "—",
                            Reps = best?.Reps ?? 0,
                            Delta = delta
                        };
                    })
                    .OrderByDescending(x => x.Weight)
                    .Take(3)
                    .ToList();

                var latest = workouts.FirstOrDefault();

                DashboardNextSessionDto? nextSession = null;

                if (latest != null)
                {
                    nextSession = new DashboardNextSessionDto
                    {
                        Title = latest.Name,
                        When = $"Last session · {latest.CreatedAt:MMM d}",
                        Exercises = latest.Sets
                            .GroupBy(s => s.Exercise?.Name ?? "Unknown")
                            .Take(4)
                            .Select(g =>
                            {
                                var heaviest = g.OrderByDescending(s => s.Weight).FirstOrDefault();

                                return new DashboardNextExerciseDto
                                {
                                    Name = g.Key,
                                    Scheme = heaviest != null ? $"{g.Count()} × {heaviest.Reps}" : "—",
                                    Target = heaviest != null ? $"{heaviest.Weight} kg" : "—"
                                };
                            })
                            .ToList()
                    };
                }

                var dto = new DashboardDto
                {
                    Username = username,
                    WeeklyVolume = thisWeekVolume,
                    WeeklySessions = thisWeek.Count,
                    WeeklySets = thisWeekSets.Count,
                    UniqueExercises = thisWeekSets.Select(s => s.ExerciseId).Distinct().Count(),
                    VolumeChange = volumeChange,
                    WeekVolume = weekVolume,
                    ExerciseSets = exerciseSetGroups,
                    RecentSessions = recentSessions,
                    Records = records,
                    NextSession = nextSession
                };

                return Ok(dto);
            }

            // ---------------- HELPERS ----------------

            private static string FormatSessionDay(Models.Workout w)
            {
                var today = DateTime.UtcNow.Date;
                var date = w.CreatedAt.Date;

                if (date == today) return "Today";
                if (date == today.AddDays(-1)) return "Yesterday";

                return date.ToString("ddd");
            }

            private static List<string> FormatTopExercises(ICollection<Models.WorkoutSet> sets)
            {
                return sets
                    .GroupBy(s => s.Exercise?.Name ?? "Unknown")
                    .Select(g =>
                    {
                        var best = g.OrderByDescending(s => s.Weight).FirstOrDefault();
                        return best != null
                            ? $"{g.Key} {best.Weight}×{best.Reps}"
                            : $"{g.Key}";
                    })
                    .OrderByDescending(x => x)
                    .Take(3)
                    .ToList();
            }
        }
    }