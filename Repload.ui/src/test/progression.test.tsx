import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

import { createRouter, RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";

import * as api from "../lib/api";


   // MOCK API
vi.mock("../lib/api", () => ({
  getRecords: vi.fn(),
}));

   // MOCK APP SHELL

vi.mock("../components/app-shell", () => ({
  AppShell: ({ children }: any) => <div>{children}</div>,
  PageHeader: ({ title }: any) => <h1>{title}</h1>,
}));

   // MOCK ICONS
vi.mock("lucide-react", () => ({
  Flame: () => <div data-testid="flame-icon" />,
  Trophy: () => <div />,
  Medal: () => <div />,
  Award: () => <div />,
  Loader2: () => <div />,
  Info: () => <div />,
  ArrowLeft: () => <div />,
  Eye: () => <div />,
  EyeOff: () => <div />,
}));

// TEST DATA

const mockRecords: api.RecordsData = {
  records: [
    {
      lift: "bench press",
      weight: 100,
      reps: 5,
      date: "2026-07-01",
    },
    {
      lift: "bench press",
      weight: 110,
      reps: 5,
      date: "2026-07-05",
    },
    {
      lift: "squat",
      weight: 140,
      reps: 5,
      date: "2026-07-03",
    },
  ] as any,

  headline: [],
  allRecords: [],
  stats: [],
};

   // RENDER HELPER
function renderPage() {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: ["/progression"],
    }),
  });

  return render(<RouterProvider router={router} />);
}

   // TESTS
describe("ProgressionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows loading state initially", async () => {
    localStorage.setItem("token", "test");

    vi.mocked(api.getRecords).mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(await screen.findByText("Loading progression...")).toBeInTheDocument();
  });

  it("redirects when no token exists", async () => {
    localStorage.removeItem("token");

    vi.mocked(api.getRecords).mockResolvedValue(mockRecords);

    renderPage();

    await waitFor(() => {
      expect(screen.queryByText("Progression")).not.toBeInTheDocument();
    });
  });

  it("renders progression cards", async () => {
    localStorage.setItem("token", "test");

    vi.mocked(api.getRecords).mockResolvedValue(mockRecords);

    renderPage();

    expect(await screen.findByText("bench press")).toBeInTheDocument();
    expect(await screen.findByText("squat")).toBeInTheDocument();
  });

  it("shows volume progression indicator", async () => {
    localStorage.setItem("token", "test");

    vi.mocked(api.getRecords).mockResolvedValue(mockRecords);

    renderPage();

    const indicators = await screen.findAllByText(/Volume-based progression/i);
    expect(indicators).toHaveLength(2);
  });

  it("handles API failure gracefully", async () => {
    localStorage.setItem("token", "test");

    vi.mocked(api.getRecords).mockRejectedValue(new Error("API Error"));

    renderPage();

    expect(await screen.findByText("Progression")).toBeInTheDocument();
    expect(screen.queryByText("Loading progression...")).not.toBeInTheDocument();
    expect(screen.queryByText("bench press")).not.toBeInTheDocument();
  });
});