namespace Repload.API.Models
{
    public class Workout
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public int UserId { get; set; }
        public User? User { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<WorkoutSet> Sets { get; set; } = new List<WorkoutSet>();
    }
}