namespace Repload.API.Models
{
    public class Exercise
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        public bool IsCustom { get; set; } = false;

        public ICollection<WorkoutSet> Sets { get; set; } = new List<WorkoutSet>();
    }
}