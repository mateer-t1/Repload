import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRouter, RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";

import * as api from "../lib/api";


  // MOCK API
vi.mock("../lib/api", () => ({
  getRecords: vi.fn(),
}));

  //  MOCK APP SHELL
vi.mock("../components/app-shell", () => ({
  AppShell: ({ children }: any) => <div>{children}</div>,
  PageHeader: ({ title }: any) => <h1>{title}</h1>,
}));


  //  MOCK ICONS
vi.mock("lucide-react", () => ({
  Award: () => <div />,
  Flame: () => <div />,
  Medal: () => <div />,
  Trophy: () => <div />,
  Loader2: () => <div data-testid="loader" />,
  Info: () => <div />,
  // Added for /login route redirect
  ArrowLeft: () => <div />,
  Eye: () => <div />,
  EyeOff: () => <div />,
}));


// TEST DATA (RUN TIME)

const mockRecords: api.RecordsData = {
  records: [
    { lift: "bench press", weight: 100, reps: 5, date: "2026-07-01" },
    { lift: "bench press", weight: 110, reps: 5, date: "2026-07-05" },
    { lift: "squat", weight: 140, reps: 5, date: "2026-07-03" },
  ],
  headline: [],
  allRecords: [],
  stats: [],
};

function renderPage() {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: ["/records"],
    }),
  });

  return render(<RouterProvider router={router} />);
}

describe("RecordsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows loading spinner initially", async () => {
    localStorage.setItem("token", "test");

    vi.mocked(api.getRecords).mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(await screen.findByTestId("loader")).toBeInTheDocument();
  });

  it("redirects to login when no token exists", async () => {
    localStorage.removeItem("token");

    vi.mocked(api.getRecords).mockResolvedValue(mockRecords as any);

    renderPage();

    await waitFor(() => {
      expect(screen.queryByText("Records")).not.toBeInTheDocument();
    });
  });

  it("renders headline top records", async () => {
    localStorage.setItem("token", "test");

    vi.mocked(api.getRecords).mockResolvedValue(mockRecords as any);

    renderPage();

    const squatCard = (await screen.findByText(/Top 1 Record/i)).closest(
      "div.relative"
    ) as HTMLElement | null;

    const benchCard = (await screen.findByText(/Top 2 Record/i)).closest(
      "div.relative"
    ) as HTMLElement | null;

    expect(within(squatCard!).getByText(/squat/i)).toBeInTheDocument();
    expect(within(benchCard!).getByText(/bench press/i)).toBeInTheDocument();
  });

  it("renders stats section", async () => {
    localStorage.setItem("token", "test");

    vi.mocked(api.getRecords).mockResolvedValue(mockRecords as any);

    renderPage();

    expect(await screen.findByText("Unique Lifts")).toBeInTheDocument();
    expect(await screen.findByText("Max Weight")).toBeInTheDocument();
    expect(await screen.findByText("Endurance Lifts")).toBeInTheDocument();
    expect(await screen.findByText("Top e1RM")).toBeInTheDocument();
  });

  it("renders all records table correctly", async () => {
    localStorage.setItem("token", "test");

    vi.mocked(api.getRecords).mockResolvedValue(mockRecords as any);

    renderPage();

    const table = await screen.findByText("All records").then(el =>
      el.closest(".rounded-xl") as HTMLElement | null
    );

    expect(within(table!).getByText(/squat/i)).toBeInTheDocument();
    expect(within(table!).getByText(/bench press/i)).toBeInTheDocument();
  });

  it("handles API failure gracefully", async () => {
    localStorage.setItem("token", "test");

    vi.mocked(api.getRecords).mockRejectedValue(new Error("API Error"));

    renderPage();

    expect(await screen.findByText("Records")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("squat")).not.toBeInTheDocument();
    });
  });
});