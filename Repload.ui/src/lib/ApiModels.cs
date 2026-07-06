namespace Repload.Api.Models;

public class HeadlineRecord
{
    public string Lift { get; set; }
    public double Weight { get; set; }
    public int Reps { get; set; }
    public string Date { get; set; }
    public int E1rm { get; set; }
}

public class RecordRow
{
    public string Lift { get; set; }
    public string Muscle { get; set; }
    public int E1rm { get; set; }
    public string Top { get; set; }
    public string Rep5 { get; set; }
    public string Rep10 { get; set; }
    public string Delta { get; set; }
    public int Days { get; set; }
}

public class Stat
{
    public string Label { get; set; }
    public string Value { get; set; }
    public string Icon { get; set; }
}

public class RecordsData
{
    public List<HeadlineRecord> Headline { get; set; }
    public List<RecordRow> AllRecords { get; set; }
    public List<Stat> Stats { get; set; }
}