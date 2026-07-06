using System.ComponentModel.DataAnnotations;

namespace Repload.API.Models
{

    public class WorkoutSet
    {
        public int Id { get; set; }

        public int WorkoutId { get; set; }
        public Workout Workout { get; set; } = null!;

        public int ExerciseId { get; set; }
        public Exercise Exercise { get; set; } = null!;

        public int Reps { get; set; }
        public double Weight { get; set; }
        public int SetNumber { get; set; }
    }

}