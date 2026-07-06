namespace Repload.API.DTOs
{
    public class WorkoutSetCreateDto
    {
        public int ExerciseId { get; set; }
        public int Reps { get; set; }
        public double Weight { get; set; }
        public int SetNumber { get; set; }
    }
}