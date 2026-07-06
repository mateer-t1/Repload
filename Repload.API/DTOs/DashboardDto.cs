namespace Repload.API.DTOs
{
    public class DashboardDto
    {
        public string Username { get; set; } = string.Empty;
        public int WeeklyVolume { get; set; }
        public int WeeklySessions { get; set; }
        public int WeeklySets { get; set; }
        public int UniqueExercises { get; set; }
        public string? VolumeChange { get; set; }
        public List<DashboardWeekVolumeDto> WeekVolume { get; set; } = new();
        public List<DashboardExerciseSetsDto> ExerciseSets { get; set; } = new();
        public List<DashboardSessionDto> RecentSessions { get; set; } = new();
        public List<DashboardRecordDto> Records { get; set; } = new();
        public DashboardNextSessionDto? NextSession { get; set; }
    }

    public class DashboardWeekVolumeDto
    {
        public string Day { get; set; } = string.Empty;
        public int Volume { get; set; }
        public string Label { get; set; } = string.Empty;
    }

    public class DashboardExerciseSetsDto
    {
        public string Name { get; set; } = string.Empty;
        public int Sets { get; set; }
        public int Target { get; set; }
    }

    public class DashboardSessionDto
    {
        public string Day { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
        public int Volume { get; set; }
        public int Prs { get; set; }
        public List<string> Exercises { get; set; } = new();
    }

    public class DashboardRecordDto
    {
        public string Lift { get; set; } = string.Empty;
        public string Weight { get; set; } = string.Empty;
        public int Reps { get; set; }
        public string Delta { get; set; } = string.Empty;
    }

    public class DashboardNextSessionDto
    {
        public string Title { get; set; } = string.Empty;
        public string When { get; set; } = string.Empty;
        public List<DashboardNextExerciseDto> Exercises { get; set; } = new();
    }

    public class DashboardNextExerciseDto
    {
        public string Name { get; set; } = string.Empty;
        public string Scheme { get; set; } = string.Empty;
        public string Target { get; set; } = string.Empty;
    }
}
