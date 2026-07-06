import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Award, Flame, Medal, Trophy, Loader2, Info } from "lucide-react";
import { AppShell, PageHeader } from "../components/app-shell";
import { getRecords } from "../lib/api";

type RawRecord = {
  lift: string;
  weight: number;
  reps: number;
  date: string;
};

const statIcons: Record<string, React.ElementType> = {
  "Unique Lifts": Trophy,
  "Max Weight": Medal,
  "Endurance Lifts": Award,
  "Top e1RM": Flame,
};

export const Route = createFileRoute("/records")({
  component: RecordsPage,
});

function calculateE1RM(weight: number, reps: number) {
  return Math.round(weight * (1 + reps / 30));
}

function formatDaysAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor(diff);
}

function RecordsPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<RawRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate({ to: "/login" });
      return;
    }

    async function load() {
      try {
        const res = await getRecords();
        setData(res.records ?? []);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load records");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  const allRecords = useMemo(() => {
    const bestPerLift: Record<string, RawRecord> = {};
    
    data.forEach(r => {
      const currentE1RM = calculateE1RM(r.weight, r.reps);
      const existing = bestPerLift[r.lift];
      if (!existing || currentE1RM > calculateE1RM(existing.weight, existing.reps)) {
        bestPerLift[r.lift] = r;
      }
    });

    return Object.values(bestPerLift)
      .map(r => ({
        ...r,
        e1rm: calculateE1RM(r.weight, r.reps),
        days: formatDaysAgo(r.date),
      }))
      .sort((a, b) => b.e1rm - a.e1rm);
  }, [data]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const headline = allRecords.slice(0, 3);
  const stats = [
    { label: "Unique Lifts", value: allRecords.length },
    { label: "Max Weight", value: Math.max(...allRecords.map(r => r.weight), 0) },
    { label: "Endurance Lifts", value: allRecords.filter(r => r.reps >= 10).length },
    { label: "Top e1RM", value: Math.max(...allRecords.map(r => r.e1rm), 0) },
  ];

  return (
    <AppShell cta={{ label: "View workouts" }} onCtaClick={() => navigate({ to: "/workouts" })}>
      <PageHeader eyebrow="Hall of fame" title="Records" subtitle="Your strongest lifts to date." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {headline.map((r, i) => (
          <div key={r.lift} className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/40 to-card/40 p-6">
            <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
              {i === 0 ? <Trophy className="h-4 w-4 text-primary" /> : i === 1 ? <Medal className="h-4 w-4 text-amber-400" /> : <Award className="h-4 w-4 text-rose-400" />}
              Top {i + 1} Record
            </div>
            <h3 className="mt-3 text-lg font-bold">{r.lift}</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-black font-mono-num">{r.weight}</span>
              <span className="text-sm text-muted-foreground">kg × {r.reps}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {stats.map((s) => {
          const Icon = statIcons[s.label] ?? Flame;
          return (
            <div key={s.label} className="rounded-xl border border-border/60 bg-card/40 p-5">
              <span className="text-xs uppercase text-muted-foreground">{s.label}</span>
              <div className="mt-3 text-2xl font-bold font-mono-num">{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-card/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-border/60">
          <h2 className="font-display font-bold">All records</h2>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>Scores are based on e1RM (Estimated 1-Rep Max)</span>
          </div>
        </div>

        <div className="grid grid-cols-12 px-6 py-2 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          <div className="col-span-5">Exercise</div>
          <div className="col-span-3 text-center">Performance</div>
          <div className="col-span-2 text-center">e1RM</div>
          <div className="col-span-2 text-right">Age</div>
        </div>

        <div className="divide-y divide-border/60">
          {allRecords.map((r) => (
            <div key={r.lift} className="grid grid-cols-12 px-6 py-3 items-center text-sm">
              <div className="col-span-5 font-medium">{r.lift}</div>
              <div className="col-span-3 text-center text-muted-foreground font-mono-num">
                {r.weight}kg × {r.reps}
              </div>
              <div className="col-span-2 text-center text-primary font-bold font-mono-num">
                {r.e1rm}
              </div>
              <div className="col-span-2 text-right text-muted-foreground text-xs">
                {r.days}d ago
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}