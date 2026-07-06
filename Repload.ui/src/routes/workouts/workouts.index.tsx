import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";

import { AppShell, PageHeader } from "../../components/app-shell";
import { WorkoutBuilder } from "../../components/workout-builder";

import {
  createWorkout,
  getMyWorkouts,
  getWorkoutFull,
  type WorkoutFull,
  type WorkoutSet,
} from "../../lib/api";

export const Route = createFileRoute("/workouts/")({
  component: WorkoutsPage,
});

type WorkoutSession = {
  id: number;
  createdAt: string;
  day: string;
  title: string;
  split: string;
  duration: string;
  volume: number;
  sets: number;
  prs: number;
  top: string[];
};

const splits = ["All", "Push", "Pull", "Legs", "Upper", "Lower", "Full"];

function inferSplit(name: string): string {
  const lower = name.toLowerCase();
  for (const split of splits.slice(1)) {
    if (lower.includes(split.toLowerCase())) return split;
  }
  return "Session";
}

function formatTopSets(sets: WorkoutSet[]): string[] {
  const bestByExercise = new Map<string, WorkoutSet>();

  for (const set of sets) {
    const current = bestByExercise.get(set.exerciseName);
    if (!current || set.weight > current.weight) {
      bestByExercise.set(set.exerciseName, set);
    }
  }

  return [...bestByExercise.values()]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((s) => `${s.exerciseName} ${s.weight} × ${s.reps}`);
}

function formatWorkoutDay(createdAt: string): string {
  const date = new Date(createdAt);
  if (isNaN(date.getTime())) return "Session";

  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";

  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function mapWorkoutToSession(workout: WorkoutFull): WorkoutSession {
  const createdAt = workout.createdAt ?? "";

  const volume = workout.sets.reduce(
    (sum, s) => sum + s.weight * s.reps,
    0
  );

  return {
    id: workout.id,
    createdAt,
    day: formatWorkoutDay(createdAt),
    title: workout.name,
    split: inferSplit(workout.name),
    duration: `${workout.sets.length} sets`,
    volume: Math.round(volume),
    sets: workout.sets.length,
    prs: 0,
    top: formatTopSets(workout.sets),
  };
}

export default function WorkoutsPage() {
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState("All time");
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [builderOpen, setBuilderOpen] = useState(false);

  const onWorkoutCreated = async (workoutId: number) => {
    try {
      const newWorkout = await getWorkoutFull(workoutId);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === workoutId ? mapWorkoutToSession(newWorkout) : s
        )
      );
    } catch (err) {
      console.error("Failed to fetch new workout details", err);
    }
  };

  const load = async () => {
    try {
      const workouts = await getMyWorkouts();

      const full = await Promise.all(
        workouts.map((w) => getWorkoutFull(w.id))
      );

      setSessions(full.map(mapWorkoutToSession));
    } catch (err: any) {
      setError(err.message ?? "Failed to load workouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredSessions = useMemo(() => {
    const now = new Date();

    return sessions.filter((s) => {
      const date = new Date(s.createdAt);
      if (isNaN(date.getTime())) return false;

      const diffDays =
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

      switch (selectedTab) {
        case "Week":
          return diffDays <= 7;
        case "Month":
          return diffDays <= 30;
        case "Year":
          return diffDays <= 365;
        default:
          return true;
      }
    });
  }, [sessions, selectedTab]);

  const handleSaveWorkout = async (
    data: { name: string; date: string }
  ): Promise<number> => {
    setCreating(true);
    setError("");

    try {
      const workout = await createWorkout({
        name: data.name,
        workoutDate: data.date,
      });

      const newWorkoutFull: WorkoutFull = {
        id: workout.id,
        name: data.name,
        createdAt: data.date,
        sets: [],
      };

      setSessions((prev) => [
        mapWorkoutToSession(newWorkoutFull),
        ...prev,
      ]);

      setBuilderOpen(false);

      return workout.id;
    } catch (err: any) {
      setError(err.message ?? "Failed to save workout");
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const totalVol = useMemo(
    () => filteredSessions.reduce((a, b) => a + b.volume, 0),
    [filteredSessions]
  );

  const totalSets = useMemo(
    () => filteredSessions.reduce((a, b) => a + b.sets, 0),
    [filteredSessions]
  );

  return (
    <AppShell
      cta={{ label: creating ? "Creating…" : "Log session" }}
      onCtaClick={() => setBuilderOpen(true)}
    >
      <PageHeader
        eyebrow="Training log"
        title="Workouts"
        subtitle="Every session, every set."
        tabs={["All time", "Year", "Month", "Week"].map((t) => ({
          label: t,
          active: selectedTab === t,
          onClick: () => setSelectedTab(t),
        }))}
      />

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div className="p-4 border rounded-xl">
          Sessions: {filteredSessions.length}
        </div>
        <div className="p-4 border rounded-xl">
          Volume: {totalVol.toLocaleString()}
        </div>
        <div className="p-4 border rounded-xl">
          Sets: {totalSets}
        </div>
        <div className="p-4 border rounded-xl">PRs: 0</div>
      </div>

      <div className="mt-6 space-y-2">
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          filteredSessions.map((s) => (
            <div
              key={s.id}
              onClick={() =>
                navigate({
                  to: "/workouts/$id",
                  params: { id: s.id.toString() },
                })
              }
              className="p-4 border rounded-lg flex justify-between cursor-pointer hover:bg-muted/20"
            >
              <div>
                <div className="font-bold">{s.title}</div>
                <div className="text-xs text-muted-foreground">
                  {s.sets} sets · {s.volume} kg
                </div>
              </div>
              <ChevronRight />
            </div>
          ))
        )}
      </div>

      {builderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl">
            <WorkoutBuilder
              date={new Date().toISOString().slice(0, 10)}
              loading={creating}
              onSave={handleSaveWorkout}
              onWorkoutSaved={onWorkoutCreated}
            />

            <button
              className="mt-3 text-sm text-white/40 p-2 cursor-pointer"
              onClick={() => setBuilderOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}