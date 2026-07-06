using System.Collections.Generic;

namespace Repload.API.DTOs
{
    public class WorkoutExerciseInputDto
    {
        public int ExerciseId { get; set; }

        public List<WorkoutSetInputDto> Sets { get; set; } = new();
    }
}