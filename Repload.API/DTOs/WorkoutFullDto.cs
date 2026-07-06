using System.Collections.Generic;

namespace Repload.API.DTOs
{
    public class WorkoutFullDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<WorkoutSetDto> Sets { get; set; } = new List<WorkoutSetDto>();
    }

    public class WorkoutSetDto
    {
        public int Id { get; set; }
        public int ExerciseId { get; set; }
        public string ExerciseName { get; set; } = string.Empty;
        public int Reps { get; set; }
        public double Weight { get; set; }
        public int SetNumber { get; set; }
    }
}
