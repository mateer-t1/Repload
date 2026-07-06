import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell, PageHeader } from "../components/app-shell";
import { WorkoutBuilder } from "../components/workout-builder";
import {
  getMyWorkouts,
  createWorkout,
  deleteWorkout,
} from "../lib/api";

//AUTH GUARD

export const Route = createFileRoute("/calendar")({
  beforeLoad: ({ location }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: CalendarPage,
});

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type CalendarWorkout = {
  id: number;
  name: string;
  userId: number;
  createdAt?: string;
};

export function CalendarPage() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [workouts, setWorkouts] = useState<CalendarWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  const [builderOpen, setBuilderOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts() {
    try {
      const data = await getMyWorkouts();
      setWorkouts(data as CalendarWorkout[]);
    } finally {
      setLoading(false);
    }
  }

  const currentMonth = useMemo(() => {
    const today = new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth() + monthOffset,
      1
    );
  }, [monthOffset]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekdayRaw = new Date(year, month, 1).getDay();
  const startWeekday = (startWeekdayRaw + 6) % 7;

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  const workoutsByDate = useMemo(() => {
    const map: Record<string, CalendarWorkout[]> = {};

    workouts.forEach((workout) => {
      if (!workout.createdAt) return;

      const key = workout.createdAt.slice(0, 10);

      if (!map[key]) map[key] = [];
      map[key].push(workout);
    });

    return map;
  }, [workouts]);

  const formatKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;

  const monthWorkouts = workouts.filter((w) => {
    if (!w.createdAt) return false;

    const d = new Date(w.createdAt);

    return d.getFullYear() === year && d.getMonth() === month;
  });

  const sessionsLogged = monthWorkouts.length;

  const today = new Date();

  const isCurrentMonth =
    today.getFullYear() === year &&
    today.getMonth() === month;

  const TODAY = isCurrentMonth ? today.getDate() : -1;

  const closeBuilder = () => {
    setBuilderOpen(false);
    setError("");
  };

  
  //  CREATE WORKOUT
  

  const handleSaveWorkout = async (data: {
    name: string;
  }): Promise<number> => {
    setCreating(true);
    setError("");

    try {
     const result = await createWorkout({ 
  name: data.name, 
  workoutDate: selectedDate 
});

      await loadWorkouts();
      setBuilderOpen(false);

      return result.id;
    } catch (err: any) {
      setError(err.message ?? "Failed to create workout");
      throw err;
    } finally {
      setCreating(false);
    }
  };

  //   DELETE WORKFLOW

  const requestDeleteWorkout = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteWorkout = async () => {
    if (!deleteTargetId) return;

    try {
      await deleteWorkout(deleteTargetId);
      setWorkouts((prev) => prev.filter((w) => w.id !== deleteTargetId));
    } catch (err) {
      console.error("Failed to delete workout", err);
    } finally {
      setDeleteTargetId(null);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <AppShell
      cta={{ label: "Log Session", icon: Dumbbell }}
        onCtaClick={() => {
        setSelectedDate(new Date().toISOString().slice(0, 10));
        setBuilderOpen(true);
      }}
    >
      <PageHeader
        eyebrow={currentMonth.toLocaleString("en-GB", {
          month: "long",
          year: "numeric",
        })}
        title="Calendar"
        subtitle="Plan ahead. Look back. See the pattern."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Sessions Logged
            </span>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 font-mono-num text-3xl font-bold">
            {sessionsLogged}
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Total Workouts
            </span>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 font-mono-num text-3xl font-bold">
            {workouts.length}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border/60 bg-card/40">
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) {
              return (
                <div
                  key={i}
                  className="h-28 border border-border/40 bg-background/20"
                />
              );
            }

            const key = formatKey(day);
            const dayWorkouts = workoutsByDate[key] || [];

            return (
              <div
                key={i}
                className="h-28 border border-border/40 p-2 cursor-pointer"
                onClick={() => {
                  setSelectedDate(key);
                  setBuilderOpen(true);
                }}
              >
                <div className="flex justify-between">
                  <span className="text-xs">{day}</span>
                </div>

                <div className="mt-2 space-y-1">
                  {dayWorkouts.slice(0, 2).map((w) => (
                    <div
                      key={w.id}
                      className="group flex items-center justify-between truncate rounded border bg-primary/10 px-2 py-1 text-[10px]"
                    >
                      <span className="truncate">{w.name}</span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          requestDeleteWorkout(w.id);
                        }}
                        className="ml-2 text-red-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {builderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-background shadow-2xl p-6">
            <WorkoutBuilder
              date={selectedDate}
              loading={creating}
              onSave={handleSaveWorkout}
            />

            <button
              onClick={closeBuilder}
              className="mt-3 text-sm text-muted-foreground hover:text-foreground 40 p-2 cursor-pointer"
            >
              Close
            </button>

            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background shadow-2xl p-6">
            <h2 className="text-lg font-semibold">
              Delete workout?
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              This action cannot be undone.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTargetId(null);
                }}
                className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted/30"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteWorkout}
                className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}