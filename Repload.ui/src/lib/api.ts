const API_URL = "http://localhost:5119";

export { API_URL };

// CORE FETCH

function getToken(): string | null {
  return localStorage.getItem("token");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();

  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.title)) ||
      text ||
      res.statusText ||
      "Request failed";

    throw new Error(message);
  }

  return data as T;
}

   // AUTH

export type AuthUser = {
  id: number;
  username: string;
  email: string;
};

export type AuthResponse = {
  token: string;
  user?: AuthUser;
};

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function setAuth(token: string, user?: AuthUser) {
  localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

// WORKOUTS

export type Workout = {
  id: number;
  name: string;
  userId: number;
  workoutDate?: string;
  sets?: WorkoutSet[];
};

export type WorkoutFull = {
  id: number;
  name: string;
  createdAt: string;
  sets: WorkoutSet[];
};

export type WorkoutSet = {
  id: number;
  exerciseId: number;
  exerciseName: string;
  reps: number;
  weight: number;
  setNumber: number;
};

export type WorkoutSetInput = {
  exerciseId: number;
  reps: number;
  weight: number;
  setNumber: number;
};

export async function getMyWorkouts(): Promise<Workout[]> {
  return apiFetch("/api/workouts/my");
}

export async function getWorkoutFull(id: number): Promise<WorkoutFull> {
  return apiFetch(`/api/workouts/${id}/full`);
}

export async function createWorkout(input: {
  name: string;
  workoutDate?: string;
}): Promise<Workout> {
  return apiFetch("/api/workouts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateWorkout(
  workoutId: number,
  sets: WorkoutSetInput[]
) {
  return apiFetch(`/api/workouts/${workoutId}/sets`, {
    method: "PUT",
    body: JSON.stringify(sets),
  });
}

export async function deleteWorkout(id: number): Promise<void> {
  return apiFetch(`/api/workouts/${id}`, {
    method: "DELETE",
  });
}

export async function saveWorkoutSets(
  workoutId: number,
  sets: WorkoutSetInput[]
): Promise<void> {
  await updateWorkout(workoutId, sets);
}


   //EXERCISES

export type ExerciseDTO = {
  id: number;
  name: string;
  isCustom?: boolean;
};

export async function searchExercises(
  query: string
): Promise<ExerciseDTO[]> {
  if (!query.trim()) return [];

  return apiFetch(
    `/api/exercises/search?query=${encodeURIComponent(query)}`
  );
}

export async function createExercise(name: string): Promise<ExerciseDTO> {
  return apiFetch("/api/exercises", {
    method: "POST",
    body: JSON.stringify({ name, isCustom: true }),
  });
}

// RECORDS

export type RecordsData = {
  records: never[];
  headline: {
    lift: string;
    weight: number;
    reps: number;
    date: string;
    e1rm: number;
  }[];
  allRecords: {
    lift: string;
    bestWeight: number;
    bestReps: number;
    e1rm: number;
    days: number;
    date: string;
  }[];
  stats: {
    label: string;
    value: string;
  }[];
};

export async function getRecords(): Promise<RecordsData> {
  return apiFetch("/api/records");
}

// DASHBOARD
export type DashboardData = {
  username: string;
  weeklyVolume: number;
  weeklySessions: number;
  weeklySets: number;
  uniqueExercises: number;
  volumeChange: string | null;
  weekVolume: { day: string; volume: number; label: string }[];
  exerciseSets: { name: string; sets: number; target: number }[];
  recentSessions: {
    day: string;
    title: string;
    duration: string;
    volume: number;
    prs: number;
    exercises: string[];
  }[];
  records: {
    lift: string;
    weight: string;
    reps: number;
    delta: string;
  }[];
  nextSession: {
    title: string;
    when: string;
    exercises: {
      name: string;
      scheme: string;
      target: string;
    }[];
  } | null;
};

export async function getDashboard(): Promise<DashboardData> {
  return apiFetch("/api/dashboard");
}



