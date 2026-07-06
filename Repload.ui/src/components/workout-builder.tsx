import { useEffect, useState } from "react";
import { Trash, Search } from "lucide-react";
import {
  searchExercises,
  createExercise,
  type ExerciseDTO,
} from "../lib/api";

export type WorkoutSetInput = {
  exerciseId: number;
  exerciseName: string;
  reps: number;
  weight: number;
  setNumber: number;
};

type Props = {
  onSave: (data: { name: string; date: string }) => Promise<number>;
  loading?: boolean;
  onWorkoutSaved?: (workoutId: number) => void;
  date: string;
};

export function WorkoutBuilder({
  onSave,
  loading,
  onWorkoutSaved,
  date,
}: Props) {
  const [name, setName] = useState("");
  const [sets, setSets] = useState<WorkoutSetInput[]>([]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ExerciseDTO[]>([]);
  const [searching, setSearching] = useState(false);

  const [customName, setCustomName] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [savingSets, setSavingSets] = useState(false);
  const [formError, setFormError] = useState("");

  const [localDate, setLocalDate] = useState(date);

  useEffect(() => {
    setLocalDate(date);
  }, [date]);

  // SEARCH 
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    let active = true;

    const timeout = setTimeout(async () => {
      try {
        setSearching(true);
        const data = await searchExercises(query);

        if (!active) return;
        setResults(data ?? []);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query]);

  //EXERCISES 
  const addExercise = (ex: ExerciseDTO) => {
    setSets((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        exerciseName: ex.name,
        reps: 0,
        weight: 0,
        setNumber: prev.filter((s) => s.exerciseId === ex.id).length + 1,
      },
    ]);

    setQuery("");
    setResults([]);
    setShowCustomForm(false);
    setCustomName("");
  };

  const addSet = (exerciseId: number) => {
    setSets((prev) => {
      const last = prev.find((s) => s.exerciseId === exerciseId);
      const count = prev.filter((s) => s.exerciseId === exerciseId).length;

      return [
        ...prev,
        {
          exerciseId,
          exerciseName: last?.exerciseName || `Exercise #${exerciseId}`,
          reps: 0,
          weight: 0,
          setNumber: count + 1,
        },
      ];
    });
  };

  const updateSet = (
    exerciseId: number,
    setNumber: number,
    field: "reps" | "weight",
    value: number
  ) => {
    setSets((prev) =>
      prev.map((s) =>
        s.exerciseId === exerciseId && s.setNumber === setNumber
          ? { ...s, [field]: value }
          : s
      )
    );
  };

  const removeExercise = (exerciseId: number) => {
    setSets((prev) => prev.filter((s) => s.exerciseId !== exerciseId));
  };

  //CREATE CUSTOM EXERCISE
  const handleCreateCustomExercise = async () => {
    if (!customName.trim()) return;

    try {
      setCreating(true);

      const created = await createExercise(customName.trim());

      addExercise({
        id: created.id,
        name: customName.trim(),
      });

      setCustomName("");
      setShowCustomForm(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to create exercise");
    } finally {
      setCreating(false);
    }
  };

  // SAVE WORKOUT 
  const handleSave = async () => {
    if (!name.trim()) {
      setFormError("Please enter a workout name");
      return;
    }

    if (sets.length === 0) {
      setFormError("Please add at least one set");
      return;
    }

    setFormError("");

    try {
      setSavingSets(true);

      const workoutId = await onSave({
        name,
        date: localDate, 
      });

      const res = await fetch(
        `http://localhost:5119/api/workouts/${workoutId}/sets`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(sets),
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setName("");
      setSets([]);
      setQuery("");
      setResults([]);
      setShowCustomForm(false);
      setCustomName("");

      onWorkoutSaved?.(workoutId);
    } catch (err: any) {
      setFormError(err.message || "Error saving workout");
    } finally {
      setSavingSets(false);
    }
  };

  const groupedExercises = Array.from(
    new Set(sets.map((s) => s.exerciseId))
  );

  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-6 space-y-6">

  
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">
          Workout date
        </label>
        <input
          type="date"
          value={localDate}
          onChange={(e) => setLocalDate(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Workout name"
        className="w-full rounded-md border px-3 py-2 text-sm"
      />

      <div className="space-y-2">
        <div className="flex items-center gap-2 border rounded px-2">
          <Search className="h-4 w-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises..."
            className="w-full py-2 bg-transparent outline-none text-sm"
          />
        </div>

        {query && (
          <div className="border rounded max-h-40 overflow-auto bg-card">
            {searching && (
              <div className="p-3 text-sm text-muted-foreground">
                Searching...
              </div>
            )}

            {!searching && results.length > 0 &&
              results.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => addExercise(ex)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted/40 p-2 cursor-pointer"
                >
                  {ex.name}
                </button>
              ))}

            {!searching && (
              <div className="p-2 border-t">
                <button
                  onClick={() => {
                    setCustomName(query);
                    setShowCustomForm(true);
                  }}
                  className="text-xs text-primary hover:underline/40 p-2 cursor-pointer"
                >
                  Do not see your exercise? Add your own
                </button>
              </div>
            )}

            {showCustomForm && (
              <div className="p-3 space-y-2 border-t">
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Exercise name"
                  className="w-full border px-2 py-1 rounded text-sm"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleCreateCustomExercise}
                    disabled={creating}
                    className="text-xs text-primary/40 p-2 cursor-pointer"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>

                  <button
                    onClick={() => {
                      setShowCustomForm(false);
                      setCustomName("");
                    }}
                    className="text-xs text-red-400 hover:40 p-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {groupedExercises.map((exerciseId) => {
          const exerciseSets = sets.filter(
            (s) => s.exerciseId === exerciseId
          );

          return (
            <div key={exerciseId} className="border rounded p-4">
              <div className="flex justify-between mb-2">
                <div className="font-medium">
                  {exerciseSets[0]?.exerciseName ||
                    `Exercise #${exerciseId}`}
                </div>

                <button
                  onClick={() => removeExercise(exerciseId)}
                  className="text-red-500"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>

              {exerciseSets.map((set) => (
                <div key={set.setNumber} className="flex items-center gap-2 mb-2">
                  <div className="relative">
                    <input
                      type="number"
                      value={set.weight}
                      onChange={(e) =>
                        updateSet(
                          exerciseId,
                          set.setNumber,
                          "weight",
                          Number(e.target.value)
                        )
                      }
                      className="w-24 border px-2 py-1 text-sm rounded"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kg</span>
                  </div>
                  <span className="text-muted-foreground">×</span>
                  <div>
                    <input
                      type="number"
                      value={set.reps}
                      onChange={(e) =>
                        updateSet(exerciseId, set.setNumber, "reps", Number(e.target.value))
                      }
                      className="w-20 border px-2 py-1 text-sm rounded"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={() => addSet(exerciseId)}
                className="text-xs text-primary hover:underline/40 p-2 cursor-pointer"
              >
                + Add set
              </button>
            </div>
          );
        })}
      </div>

      {formError && (
        <p className="text-sm text-red-400">{formError}</p>
      )}

      <button
        onClick={handleSave}
        disabled={loading || savingSets || sets.length === 0}
        className="w-full bg-primary text-white py-2 rounded-md disabled:opacity-50 font-medium/40 p-2 cursor-pointer"
      >
        {savingSets ? "Saving..." : "Save Workout"}
      </button>
    </div>
  );
}