using System.Collections.Generic;

namespace Repload.API.DTOs
{
    public class CreateWorkoutFullDto
    {
        public string Name { get; set; } = string.Empty;

        public List<WorkoutExerciseInputDto> Exercises { get; set; } = new();
    }
}