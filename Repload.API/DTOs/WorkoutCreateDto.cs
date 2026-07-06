namespace Repload.API.DTOs
{
    public class WorkoutCreateDto
    {
        public string Name { get; set; } = string.Empty;

        public DateTime? WorkoutDate { get; set; }
    }
}