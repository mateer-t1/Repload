import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import React from "react";

import { Dashboard } from "../routes/dashboard";
import * as api from "../lib/api";

// -------------------------
// mocks
// -------------------------

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({}),
  useNavigate: () => navigate,
  useRouterState: () => ({
    location: { pathname: "/dashboard" },
  }),
  Link: ({ children }: any) => <a>{children}</a>,
}));

vi.mock("../lib/api", () => ({
  getDashboard: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader" />,
  Dumbbell: () => <div />,
  BarChart3: () => <div />,
  LineChart: () => <div />,
  Trophy: () => <div />,
  Calendar: () => <div />,
  Plus: () => <div />,
  Target: () => <div />,
  Timer: () => <div />,
  ArrowUpRight: () => <div />,
  ChevronRight: () => <div />,
  MoreHorizontal: () => <div />,
  Zap: () => <div />,
}));


// MOCK DATA


const mockData: api.DashboardData = {
  username: "john",

  weeklyVolume: 1200,
  weeklySets: 10,
  uniqueExercises: 4,
  weeklySessions: 3,

  volumeChange: "+10%",

  weekVolume: [
    { day: "Mon", volume: 100, label: "Chest" },
    { day: "Tue", volume: 200, label: "Back" },
  ],

  exerciseSets: [
    { name: "Bench", sets: 5, target: 5 },
  ],

  recentSessions: [
    {
      day: "Mon",
      duration: "1h",
      title: "Push Day",
      exercises: ["Bench"],
      volume: 1000,
      prs: 1,
    },
  ],

  records: [
    {
      lift: "Bench Press",
      weight: "100 kg",
      reps: 5,
      delta: "+5",
    },
  ],

  nextSession: {
    title: "Leg Day",
    when: "Tomorrow",
    exercises: [
      { name: "Squat", scheme: "5x5", target: "100kg" },
    ],
  },
};

describe("Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("redirects to login if no token", async () => {
    localStorage.clear();

    render(<Dashboard />);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({
        to: "/login",
      });
    });
  });

  it("shows loader initially", () => {
    vi.mocked(api.getDashboard).mockReturnValue(new Promise(() => {}));

    localStorage.setItem("token", "fake-token");

    render(<Dashboard />);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("renders dashboard data", async () => {
    vi.mocked(api.getDashboard).mockResolvedValue(mockData);

    localStorage.setItem("token", "fake-token");

    render(<Dashboard />);

    expect(
      await screen.findByText(/welcome back, john/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/total volume/i)).toBeInTheDocument();
    expect(screen.getByText("Push Day")).toBeInTheDocument();
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
    expect(screen.getByText("Leg Day")).toBeInTheDocument();
  });

  it("shows error state when API fails", async () => {
    vi.mocked(api.getDashboard).mockRejectedValue(
      new Error("Failed to load dashboard")
    );

    localStorage.setItem("token", "fake-token");

    render(<Dashboard />);

    expect(
      await screen.findByText(/failed to load dashboard/i)
    ).toBeInTheDocument();
  });

  it("calls logout and redirects", async () => {
    vi.mocked(api.getDashboard).mockResolvedValue(mockData);

    localStorage.setItem("token", "fake-token");

    render(<Dashboard />);

    await screen.findByText(/welcome back/i);

    screen.getByText(/log out/i).click();

    expect(api.logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith({
      to: "/login",
      replace: true,
    });
  });
});