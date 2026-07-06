import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { CalendarPage } from "../routes/calendar";
import * as api from "../lib/api";

//  MOCK NAVIGATION

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (component: any) => component,
  redirect: vi.fn(),
  useNavigate: () => navigate,
  useRouterState: () => ({ location: { pathname: "/calendar" } }),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

//  MOCK API

vi.mock("../lib/api", () => ({
  getMyWorkouts: vi.fn(),
  createWorkout: vi.fn(),
  deleteWorkout: vi.fn(),
}));

   // MOCK COMPONENTS

vi.mock("../components/app-shell", () => ({
  AppShell: ({ children, onCtaClick }: any) => (
    <div>
      <button onClick={onCtaClick}>Log Session</button>
      {children}
    </div>
  ),
  PageHeader: ({ title }: any) => <h1>{title}</h1>,
}));

vi.mock("../components/workout-builder", () => ({
  WorkoutBuilder: ({ onSave, date, loading }: any) => (
    <div data-testid="workout-builder">
      <p>Selected date: {date}</p>

      <button
        disabled={loading}
        onClick={async () => {
          try {
            await onSave({ name: "New Workout from test" });
          } catch {}
        }}
      >
        {loading ? "Saving..." : "Save Workout"}
      </button>
    </div>
  ),
}));

vi.mock("lucide-react", () => ({
  Dumbbell: () => <div />,
  Trophy: () => <div />,
  ChevronLeft: () => <div />,
  ChevronRight: () => <div />,
}));



const TODAY = new Date("2026-07-05T00:00:00Z");
const YESTERDAY = new Date("2026-07-04T00:00:00Z");

const mockWorkouts = [
  { id: 1, name: "Push Day", userId: 1, createdAt: TODAY.toISOString() },
  { id: 2, name: "Pull Day", userId: 1, createdAt: YESTERDAY.toISOString() },
];

   // TEST SUITE

describe("CalendarPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "fake-token");
    vi.mocked(api.getMyWorkouts).mockResolvedValue(mockWorkouts as any);
  });

  it("renders calendar and loads workouts", async () => {
    render(<CalendarPage />);

    expect(await screen.findByText("Calendar")).toBeInTheDocument();
    expect(api.getMyWorkouts).toHaveBeenCalledTimes(1);

    expect(await screen.findByText("Push Day")).toBeInTheDocument();
  });

  it("opens workout builder via CTA", async () => {
    const user = userEvent.setup();
    render(<CalendarPage />);

    await user.click(screen.getByRole("button", { name: /log session/i }));

    expect(screen.getByTestId("workout-builder")).toBeInTheDocument();
    expect(screen.getByText(/selected date:/i)).toBeInTheDocument();
  });

  it("opens workout builder when clicking a calendar day", async () => {
    const user = userEvent.setup();
    render(<CalendarPage />);

    await screen.findByText("Calendar");

    const dayButton =
      screen.getAllByText(/\d+/).find((el) => el.textContent === "15") ??
      screen.getByText("15");

    await user.click(dayButton);

    expect(screen.getByTestId("workout-builder")).toBeInTheDocument();
    expect(screen.getByText(/selected date:/i)).toBeInTheDocument();
  });

  it("creates a workout and refetches list", async () => {
    const user = userEvent.setup();

    vi.mocked(api.createWorkout).mockResolvedValue({ id: 3 } as any);

    const getMyWorkoutsMock = vi.mocked(api.getMyWorkouts);

    render(<CalendarPage />);

    await user.click(screen.getByRole("button", { name: /log session/i }));

    const save = await screen.findByRole("button", {
      name: /save workout/i,
    });

    await user.click(save);

    await waitFor(() => {
      expect(api.createWorkout).toHaveBeenCalled();
    });

    expect(screen.queryByTestId("workout-builder")).not.toBeInTheDocument();
    expect(getMyWorkoutsMock).toHaveBeenCalledTimes(2);
  });

  it("deletes a workout", async () => {
    const user = userEvent.setup();

    vi.mocked(api.deleteWorkout).mockResolvedValue(undefined);

    render(<CalendarPage />);

    const workout = await screen.findByText("Push Day");

    const container = workout.parentElement!;
    await user.hover(container);

    const deleteBtn = within(container).getByText("✕");
    await user.click(deleteBtn);

    expect(await screen.findByText("Delete workout?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(api.deleteWorkout).toHaveBeenCalledWith(1);
    });

    expect(screen.queryByText("Push Day")).not.toBeInTheDocument();
  });

  it("shows error on creation failure", async () => {
    const user = userEvent.setup();

    vi.mocked(api.createWorkout).mockRejectedValue(
      new Error("Creation failed")
    );

    render(<CalendarPage />);

    await user.click(screen.getByRole("button", { name: /log session/i }));

    const save = await screen.findByRole("button", {
      name: /save workout/i,
    });

    await user.click(save);

    expect(await screen.findByText("Creation failed")).toBeInTheDocument();
  });
});