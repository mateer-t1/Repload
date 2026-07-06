import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
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

export const Route = createFileRoute("/workouts")({
  beforeLoad: () => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw redirect({
        to: "/login",
      });
    }
  },
  component: WorkoutsLayout,
});

function WorkoutsLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

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
    if (lower.includes(split.toLowerCase())) {
      return split;
    }
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

function formatWorkoutDay(createdAt?: string, index = 0): string {
  if (!createdAt) return index === 0 ? "Latest" : "Session";

  const date = new Date(createdAt);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
  });
}

function mapWorkoutToSession(
  workout: WorkoutFull,
  index: number
): WorkoutSession {
  const createdAt = workout.createdAt ?? "";

  const volume = workout.sets.reduce(
    (sum, s) => sum + s.weight * s.reps,
    0
  );

  return {
    id: workout.id,
    createdAt,
    day: formatWorkoutDay(createdAt, index),
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

  const [activeTab, setActiveTab] = useState("All time");
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);

  useEffect(() => {
    async function loadWorkouts() {
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
    }

    loadWorkouts();
  }, []);

  const handleSaveWorkout = async (data: {
  name: string;
}): Promise<number> => {
  setCreating(true);
  setError("");

  try {
    const workout = await createWorkout({ name: data.name });

    const workouts = await getMyWorkouts();
    const full = await Promise.all(
      workouts.map((w) => getWorkoutFull(w.id))
    );

    setSessions(full.map(mapWorkoutToSession));
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
    () => sessions.reduce((a, b) => a + b.volume, 0),
    [sessions]
  );

  const totalSets = useMemo(
    () => sessions.reduce((a, b) => a + b.sets, 0),
    [sessions]
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
        tabs={[
          {
            label: "All time",
            active: activeTab === "All time",
            onClick: () => setActiveTab("All time"),
          },
          {
            label: "Year",
            active: activeTab === "Year",
            onClick: () => setActiveTab("Year"),
          },
          {
            label: "Month",
            active: activeTab === "Month",
            onClick: () => setActiveTab("Month"),
          },
          {
            label: "Week",
            active: activeTab === "Week",
            onClick: () => setActiveTab("Week"),
          },
        ]}
      />

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border p-4">
          Sessions: {sessions.length}
        </div>

        <div className="rounded-xl border p-4">
          Volume: {totalVol.toLocaleString()}
        </div>

        <div className="rounded-xl border p-4">
          Sets: {totalSets}
        </div>

        <div className="rounded-xl border p-4">
          PRs: 0
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              onClick={() =>
                navigate({
                  to: "/workouts/$id",
                  params: {
                    id: s.id.toString(),
                  },
                })
              }
              className="flex cursor-pointer justify-between rounded-lg border p-4 transition hover:bg-muted/20"
            >
              <div>
                <div className="font-bold">{s.title}</div>

                <div className="text-xs text-muted-foreground">
                  {s.sets} sets · {s.volume.toLocaleString()} kg
                </div>
              </div>

              <ChevronRight />
            </div>
          ))
        )}
      </div>
<WorkoutBuilder
  date={new Date().toISOString().split("T")[0]}
  onSave={handleSaveWorkout}
/>
    </AppShell>
  );
}