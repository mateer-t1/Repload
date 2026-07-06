import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import React from "react";

import { WorkoutPage } from "../routes/workouts/$id";
import * as api from "../lib/api";

  //  TANSTACK ROUTER MOCK

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => {
  return {
    createFileRoute: () => {
      return () => ({
        useParams: () => ({
          id: "1",
        }),
      });
    },

    useNavigate: () => navigate,

    useRouterState: () => ({
      location: { pathname: "/workouts" },
    }),

    Link: ({ children }: any) => children,
  };
});

  //  API MOCK
vi.mock("../lib/api", () => ({
  getWorkoutFull: vi.fn(),
  updateWorkout: vi.fn(),
  deleteWorkout: vi.fn(),
  searchExercises: vi.fn(),
}));

  //  COMPONENT MOCKS
vi.mock("../../components/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),

  PageHeader: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));

  //  ICON MOCK

vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader" />,
  Trash2: () => <div />,
  Search: () => <div />,
  BarChart3: () => <div />,
  Calendar: () => <div />,
  Dumbbell: () => <div />,
  LineChart: () => <div />,
  Trophy: () => <div />,
  Plus: () => <div />,
}));

  //  TEST DATA

const mockWorkout: api.WorkoutFull = {
  id: 1,
  name: "Test Push Day",
  createdAt: "2026-07-05T10:00:00Z",
  sets: [
    {
      id: 101,
      exerciseId: 1,
      exerciseName: "Bench Press",
      reps: 8,
      weight: 100,
      setNumber: 1,
    },
    {
      id: 102,
      exerciseId: 1,
      exerciseName: "Bench Press",
      reps: 8,
      weight: 100,
      setNumber: 2,
    },
    {
      id: 201,
      exerciseId: 2,
      exerciseName: "Overhead Press",
      reps: 5,
      weight: 60,
      setNumber: 1,
    },
  ],
};

const mockSearchExercises: api.ExerciseDTO[] = [
  { id: 3, name: "Dumbbell Flyes" },
];

  //  TESTS

describe("WorkoutPage (workouts/$id)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(api.getWorkoutFull).mockResolvedValue(mockWorkout);
    vi.mocked(api.updateWorkout).mockResolvedValue(undefined);
    vi.mocked(api.deleteWorkout).mockResolvedValue(undefined);
    vi.mocked(api.searchExercises).mockResolvedValue(mockSearchExercises);
  });

  it("shows loader while fetching", () => {
    vi.mocked(api.getWorkoutFull).mockReturnValue(new Promise(() => {}));
    render(<WorkoutPage />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });


  it("renders workout details after loading", async () => {
    render(<WorkoutPage />);

    expect(await screen.findByText("Test Push Day")).toBeInTheDocument();
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(screen.getByText("Overhead Press")).toBeInTheDocument();

    const weightInputs = await screen.findAllByDisplayValue("100");
    expect(weightInputs.length).toBeGreaterThan(0);
  });

  it("allows updating a set's weight and reps", async () => {
    const user = userEvent.setup();
    render(<WorkoutPage />);

    const weightInput = (await screen.findAllByDisplayValue("60"))[0];
    const repsInput = (await screen.findAllByDisplayValue("5"))[0];

    await user.clear(weightInput);
    await user.type(weightInput, "65");
    expect(weightInput).toHaveValue(65);

    await user.clear(repsInput);
    await user.type(repsInput, "6");
    expect(repsInput).toHaveValue(6);
  });

  it("allows adding a new set to an exercise", async () => {
    const user = userEvent.setup();
    render(<WorkoutPage />);

    const benchPressSection = (
      await screen.findByText("Bench Press")
    ).closest("div.border") as HTMLElement;

    expect(within(benchPressSection).getAllByRole("spinbutton")).toHaveLength(4);

    await user.click(within(benchPressSection).getByText("+ Add set"));

    expect(within(benchPressSection).getAllByRole("spinbutton")).toHaveLength(6);
  });

  it("allows searching and adding a new exercise", async () => {
    const user = userEvent.setup();
    render(<WorkoutPage />);

    await screen.findByText("Test Push Day");

    expect(screen.queryByText("Dumbbell Flyes")).not.toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText(/search exercises/i),
      "Dumbbell"
    );

    await user.click(await screen.findByText("Dumbbell Flyes"));

    expect(await screen.findByText("Dumbbell Flyes")).toBeInTheDocument();
  });

  it("allows deleting an exercise", async () => {
    const user = userEvent.setup();
    render(<WorkoutPage />);

    const exerciseSection = (
      await screen.findByText("Overhead Press")
    ).closest("div.border") as HTMLElement;

    await user.click(within(exerciseSection).getByText("Delete"));

    expect(screen.queryByText("Overhead Press")).not.toBeInTheDocument();
  });

  it("saves changes when save button is clicked", async () => {
    const user = userEvent.setup();
    render(<WorkoutPage />);

    const weightInput = (await screen.findAllByDisplayValue("60"))[0];

    await user.clear(weightInput);
    await user.type(weightInput, "65");
    await user.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(api.updateWorkout).toHaveBeenCalledWith(
        1,
        expect.arrayContaining([
          expect.objectContaining({
            exerciseId: 2,
            weight: 65,
            reps: 5,
          }),
        ])
      );
    });

    expect(await screen.findByText("Changes saved")).toBeInTheDocument();
  });

  it("handles workout deletion", async () => {
    const user = userEvent.setup();
    render(<WorkoutPage />);

    await user.click(await screen.findByText("Delete Workout"));
    expect(await screen.findByText("Delete workout?")).toBeInTheDocument();

 const modalContainer = screen
  .getByText("Delete workout?")
  .closest("div.bg-background") as HTMLElement;

    const confirmButton = within(modalContainer!).getByRole("button", {
      name: "Delete",
    });

    await user.click(confirmButton);

    await waitFor(() => {
      expect(api.deleteWorkout).toHaveBeenCalledWith(1);
    });

    expect(navigate).toHaveBeenCalledWith({ to: "/workouts" });
  });
});