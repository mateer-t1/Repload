import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell, PageHeader } from "../components/app-shell";
import { getRecords } from "../lib/api";
import { Flame } from "lucide-react";

type RawRecord = {
  lift: string;
  weight: number;
  reps: number;
  date: string;
  e1rm?: number;
};

export const Route = createFileRoute("/progression")({
  component: ProgressionPage,
});

//  CORE MATH

function calculateE1RM(weight: number, reps: number) {
  return Math.round(weight * (1 + reps / 30));
}

function calculateVolume(weight: number, reps: number) {
  return weight * reps;
}

function calculateVolumeProgress(points: { volume: number }[]) {
  if (points.length < 2)
    return { change: 0, trend: "stable" as const };

  const first = points[0].volume;
  const last = points[points.length - 1].volume;

  if (first === 0)
    return { change: 0, trend: "stable" as const };

  const changePct = ((last - first) / first) * 100;

  let trend: "up" | "down" | "stable" = "stable";

  if (changePct >= 5) trend = "up";
  else if (changePct <= -5) trend = "down";

  return {
    change: Math.round(changePct),
    trend,
  };
}

function ProgressionPage() {
  const navigate = useNavigate();

  const goWorkouts = () => navigate({ to: "/workouts" });

  const [records, setRecords] = useState<RawRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate({ to: "/login" });
      return;
    }

    async function load() {
      try {
        const res = await getRecords();
        setRecords(res.records ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  const progression = useMemo(() => {
    if (!records.length) return [];

    const grouped: Record<string, RawRecord[]> = {};

    for (const r of records) {
      if (!grouped[r.lift]) grouped[r.lift] = [];
      grouped[r.lift].push(r);
    }

    Object.keys(grouped).forEach((lift) => {
      grouped[lift].sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      );
    });

    return Object.entries(grouped).map(([lift, lifts]) => {
      const points = lifts.slice(-6).map((r) => {
        const e1rm =
          r.e1rm ?? calculateE1RM(r.weight, r.reps);

        const volume = calculateVolume(r.weight, r.reps);

        return {
          date: r.date,
          e1rm,
          volume,
        };
      });

      const values = points.map((p) => p.e1rm);

      const max = Math.max(...values);
      const min = Math.min(...values);

      const currentE1RM =
        points[points.length - 1]?.e1rm ?? 0;

      const { change, trend } =
        calculateVolumeProgress(points);

      return {
        lift,
        points,
        max,
        min,
        currentE1RM,
        change,
        trend,
      };
    });
  }, [records]);

  if (loading) {
    return (
      <AppShell onCtaClick={goWorkouts}>
        <div className="p-6 text-muted-foreground">
          Loading progression...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell onCtaClick={goWorkouts}>
      <PageHeader
        eyebrow="Performance tracking"
        title="Progression"
        subtitle="Track strength changes over time."
      />

      <div className="px-6 pb-2 text-[11px] text-muted-foreground leading-snug max-w-2xl">
        Progress is calculated using training volume (weight × reps).
        A change of ±5% or more indicates progression or regression,
        while smaller changes indicate a plateau.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {progression.map((p) => (
          <div
            key={p.lift}
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6"
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <h3 className="font-display font-bold capitalize">
                {p.lift}
              </h3>

              <div className="text-right text-xs font-mono-num">
                <div
                  className={
                    p.trend === "up"
                      ? "text-primary"
                      : p.trend === "down"
                      ? "text-red-400"
                      : "text-muted-foreground"
                  }
                >
                  {p.change >= 0 ? "+" : ""}
                  {p.change}% volume
                </div>

                <div className="text-muted-foreground">
                  {p.currentE1RM} e1RM
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-end gap-2 h-28">
              {p.points.map((pt, i) => {
                const heightPct =
                  p.max === 0
                    ? 0
                    : (pt.e1rm / p.max) * 100;

                return (
                  <div
                    key={i}
                    className="relative flex-1 h-full flex items-end"
                  >
                    <div className="absolute bottom-0 w-full h-full rounded-md bg-muted/10" />

                    <div
                      className="relative w-full rounded-md bg-gradient-to-t from-primary/60 via-primary/30 to-primary/10"
                      style={{
                        height: `${heightPct}%`,
                      }}
                    />

                    <div className="absolute bottom-1 w-full flex justify-center">
                      <span className="text-[10px] font-mono-num px-1.5 py-0.5 rounded bg-black/40 text-white/90 backdrop-blur-sm">
                        {pt.e1rm}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Range: {p.min} → {p.max}
              </span>

              <span className="flex items-center gap-1 text-primary">
                <Flame className="h-3 w-3" />
                Volume-based progression
              </span>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}