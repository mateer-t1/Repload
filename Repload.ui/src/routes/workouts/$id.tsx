import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Trash2, Loader2, Search } from "lucide-react";
import { AppShell, PageHeader } from "../../components/app-shell";
import {
  getWorkoutFull,
  searchExercises,
  updateWorkout,
  deleteWorkout,
  type WorkoutFull,
  type WorkoutSet,
  type ExerciseDTO,
} from "../../lib/api";

export const Route = createFileRoute("/workouts/$id")({
  component: WorkoutPage,
});

export function WorkoutPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const workoutId = Number(id);

  const [workout, setWorkout] = useState<WorkoutFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ExerciseDTO[]>([]);
  const [searching, setSearching] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  //  LOAD WORKOUT 
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getWorkoutFull(workoutId);
        setWorkout(data);
      } catch {
        setWorkout(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [workoutId]);

  // SEARCH 
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    let active = true;
    const currentQuery = query;

    const timeout = setTimeout(async () => {
      try {
        setSearching(true);
        const data = await searchExercises(currentQuery);
        if (active) setResults(data ?? []);
      } finally {
        if (active) setSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query]);

  // GROUP SETS 
  const grouped = useMemo(() => {
    if (!workout) return {};
    return workout.sets.reduce((acc: Record<string, WorkoutSet[]>, set) => {
      if (!acc[set.exerciseName]) acc[set.exerciseName] = [];
      acc[set.exerciseName].push(set);
      return acc;
    }, {});
  }, [workout]);

  const totalVolume = useMemo(() => {
    if (!workout) return 0;
    return workout.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  }, [workout]);

  // UPDATE SET 
  const updateSet = (id: number, field: "reps" | "weight", value: number) => {
    if (!workout) return;

    setWorkout({
      ...workout,
      sets: workout.sets.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    });
  };

  // ADD EXERCIS
  const addExercise = (ex: ExerciseDTO) => {
    if (!workout) return;

    const exists = workout.sets.some((s) => s.exerciseId === ex.id);
    if (exists) return;

    setWorkout({
      ...workout,
      sets: [
        ...workout.sets,
        {
          id: Date.now(),
          exerciseId: ex.id,
          exerciseName: ex.name,
          reps: 0,
          weight: 0,
          setNumber: workout.sets.length + 1,
        },
      ],
    });

    setQuery("");
    setResults([]);
  };

  // ADD SET
  const addSet = (exerciseName: string) => {
    if (!workout) return;

    const exerciseSets = workout.sets.filter(
      (s) => s.exerciseName === exerciseName
    );

    const last =
      exerciseSets.length > 0
        ? Math.max(...exerciseSets.map((s) => s.setNumber))
        : 0;

    const exerciseId = exerciseSets[0]?.exerciseId ?? 0;

    setWorkout({
      ...workout,
      sets: [
        ...workout.sets,
        {
          id: Date.now(),
          exerciseId,
          exerciseName,
          reps: 0,
          weight: 0,
          setNumber: last + 1,
        },
      ],
    });
  };

  // DELETE EXERCISE
  const deleteExercise = (name: string) => {
    if (!workout) return;

    setWorkout({
      ...workout,
      sets: workout.sets.filter((s) => s.exerciseName !== name),
    });
  };

  // SAVE
  const handleSave = async () => {
    if (!workout) return;

    setSaving(true);

    try {
      await updateWorkout(
        workoutId,
        workout.sets.map((s) => ({
          exerciseId: s.exerciseId,
          reps: s.reps,
          weight: s.weight,
          setNumber: s.setNumber,
        }))
      );

      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  // DELETE 
  const handleDeleteWorkout = async () => {
    await deleteWorkout(workoutId);
    navigate({ to: "/workouts" });
  };

  //  UI 
  if (loading) {
    return (
      <div className="p-6">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!workout) {
    return <div className="p-6">Workout not found</div>;
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Workout"
        title={workout.name}
        subtitle={`Total volume: ${Math.round(totalVolume)} kg`}
      />

      <div className="p-6 space-y-6">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-500 rounded-lg"
        >
          <Trash2 size={16} />
          Delete Workout
        </button>

        <div className="space-y-2">
          <div className="flex items-center gap-2 border rounded px-2">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full py-2 bg-transparent outline-none text-sm"
            />
          </div>

          {query && (
            <div className="border rounded">
              {searching ? (
                <div className="p-2">Searching...</div>
              ) : (
                results.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => addExercise(ex)}
                    className="w-full text-left p-2 hover:bg-muted/40"
                  >
                    {ex.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {Object.entries(grouped).map(([name, sets]) => (
          <div key={name} className="border rounded p-4">
            <div className="flex justify-between mb-3">
              <h2 className="font-bold">{name}</h2>

              <div className="flex gap-3">
                <button onClick={() => addSet(name)} className="text-sm text-primary">
                  + Add set
                </button>

                <button onClick={() => deleteExercise(name)} className="text-sm text-red-500">
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {sets.map((set) => (
                <div key={set.id} className="flex gap-3">
                  <input
                    type="number"
                    value={set.weight}
                    onChange={(e) =>
                      updateSet(set.id, "weight", Number(e.target.value))
                    }
                    className="w-24 border rounded px-2 py-1 text-sm"
                  />

                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(set.id, "reps", Number(e.target.value))
                    }
                    className="w-20 border rounded px-2 py-1 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={handleSave}
          className="w-full bg-primary text-black font-semibold py-2 rounded"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {savedMessage && (
          <div className="text-sm text-green-500">Changes saved</div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background border p-6 rounded-xl">
            <h2 className="text-lg font-semibold">Delete workout?</h2>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button onClick={handleDeleteWorkout} className="bg-red-500 text-white px-4 py-2 rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}