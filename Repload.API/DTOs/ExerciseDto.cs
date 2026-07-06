namespace Repload.API.DTOs
{
    public class ExerciseDto
    {
        public int Id { get; set; }   // 🔥 REQUIRED
        public string Name { get; set; } = string.Empty;
        public bool IsCustom { get; set; } = false;
    }
}