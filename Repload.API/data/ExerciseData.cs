using Repload.API.Models;

namespace Repload.API.Data
{
    public static class ExerciseData
    {
        public static List<Exercise> GetDefaultExercises()
        {
            return new List<Exercise>
            {
                // Chest
                new Exercise { Name = "Bench Press", IsCustom = false },
                new Exercise { Name = "Incline Bench Press", IsCustom = false },
                new Exercise { Name = "Dumbbell Press", IsCustom = false },
                new Exercise { Name = "Chest Fly", IsCustom = false },
                
                // Back
                new Exercise { Name = "Deadlift", IsCustom = false },
                new Exercise { Name = "Lat Pulldown", IsCustom = false },
                new Exercise { Name = "Barbell Row", IsCustom = false },
                new Exercise { Name = "Seated Row", IsCustom = false },
                new Exercise { Name = "Pull Up", IsCustom = false },
                
                // Legs
                new Exercise { Name = "Squat", IsCustom = false },
                new Exercise { Name = "Leg Press", IsCustom = false },
                new Exercise { Name = "Leg Extension", IsCustom = false },
                new Exercise { Name = "Hamstring Curl", IsCustom = false },
                new Exercise { Name = "Lunges", IsCustom = false },
                new Exercise { Name = "Calf Raise", IsCustom = false },
                
                // Shoulders
                new Exercise { Name = "Overhead Press", IsCustom = false },
                new Exercise { Name = "Lateral Raise", IsCustom = false },
                new Exercise { Name = "Front Raise", IsCustom = false },
                new Exercise { Name = "Face Pull", IsCustom = false },
                
                // Arms
                new Exercise { Name = "Bicep Curl", IsCustom = false },
                new Exercise { Name = "Hammer Curl", IsCustom = false },
                new Exercise { Name = "Tricep Extension", IsCustom = false },
                new Exercise { Name = "Dips", IsCustom = false }
            };
        }
    }
}