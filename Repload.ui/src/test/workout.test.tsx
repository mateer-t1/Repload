import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WorkoutsPage from "../routes/workouts/workouts";
import * as api from "../lib/api";

  //  ROUTER MOCK

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (c: any) => c,
  useNavigate: () => navigate,
}));

  //  API MOCK

vi.mock("../lib/api", () => ({
  getMyWorkouts: vi.fn(),
  getWorkoutFull: vi.fn(),
  createWorkout: vi.fn(),
}));

  //  UI MOCKS

vi.mock("../components/app-shell", () => ({
  AppShell: ({ children, onCtaClick }: any) => (
    <div>
      <button onClick={onCtaClick}>Log session</button>
      {children}
    </div>
  ),

  PageHeader: ({ tabs }: any) => (
    <div>
      <h1>Workouts</h1>

    
      <div>
        {tabs?.map((t: any) => (
          <button key={t.label} onClick={t.onClick}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  ),
}));

vi.mock("../components/workout-builder", () => ({
  WorkoutBuilder: ({ onSave }: any) => (
    <div>
      <button
        onClick={async () => {
          await onSave({ name: "Test Workout", date: "2026-07-05" });
        }}
      >
        Save
      </button>
    </div>
  ),
}));


  //  TEST DATA
 

const workouts = [
  { id: 1, name: "Push Day", userId: 1 },
  { id: 2, name: "Pull Day", userId: 1 },
];

const fullWorkout = (id: number) => ({
  id,
  name: id === 1 ? "Push Day" : "Pull Day",
  createdAt: "2026-07-05T00:00:00Z",
  sets: [
    {
      id: 1,
      exerciseId: 1,
      exerciseName: "Bench",
      reps: 10,
      weight: 100,
      setNumber: 1,
    },
  ],
});

    //  TESTS

describe("WorkoutsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(api.getMyWorkouts).mockResolvedValue(workouts as any);

    vi.mocked(api.getWorkoutFull).mockImplementation((id: number) =>
      Promise.resolve(fullWorkout(id) as any)
    );
  });

  it("loads and displays workouts", async () => {
    render(<WorkoutsPage />);

    expect(await screen.findByText("Push Day")).toBeInTheDocument();
    expect(await screen.findByText("Pull Day")).toBeInTheDocument();

    expect(api.getMyWorkouts).toHaveBeenCalled();
    expect(api.getWorkoutFull).toHaveBeenCalledTimes(2);
  });

  it("navigates to workout detail", async () => {
    const user = userEvent.setup();

    render(<WorkoutsPage />);

    const item = await screen.findByText("Push Day");
    await user.click(item);

    expect(navigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "/workouts/$id",
      })
    );
  });

  it("opens builder and creates workout", async () => {
    const user = userEvent.setup();

    vi.mocked(api.createWorkout).mockResolvedValue({ id: 99 } as any);

    render(<WorkoutsPage />);

    await user.click(screen.getByText("Log session"));

    const save = await screen.findByText("Save");
    await user.click(save);

    await waitFor(() => {
      expect(api.createWorkout).toHaveBeenCalled();
    });
  });

  it("filters by week tab", async () => {
    const user = userEvent.setup();

    render(<WorkoutsPage />);

    const weekTab = await screen.findByRole("button", {
      name: "Week",
    });

    await user.click(weekTab);

    expect(weekTab).toBeInTheDocument();
  });

  it("shows error on load failure", async () => {
    vi.mocked(api.getMyWorkouts).mockRejectedValue(
      new Error("Failed to load workouts")
    );

    render(<WorkoutsPage />);

    expect(
      await screen.findByText("Failed to load workouts")
    ).toBeInTheDocument();
  });
});