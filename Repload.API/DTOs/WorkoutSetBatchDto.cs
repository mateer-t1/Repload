namespace Repload.API.DTOs
{
    public class WorkoutSetBatchDto
    {
        public List<WorkoutSetInputDto> Sets { get; set; } = new();
    }
}