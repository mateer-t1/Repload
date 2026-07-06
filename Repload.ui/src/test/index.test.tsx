import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

import Index from "../routes/index";


   // MOCK ROUTER
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({}),
}));

  // MOCK AUTH STORE

const mockUseAuthStore = vi.fn();

vi.mock("../auth", () => ({
  useAuthStore: (selector: any) => mockUseAuthStore(selector),
}));


vi.mock("lucide-react", () => ({
  ArrowUpRight: () => <div data-testid="icon-arrow" />,
  TrendingUp: () => <div />,
  Activity: () => <div />,
  BarChart3: () => <div />,
  Dumbbell: () => <div />,
  Check: () => <div />,
  Plus: () => <div />,
  Zap: () => <div />,
}));

   // TESTS
describe("Index (Landing Page)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders hero title", () => {
    mockUseAuthStore.mockReturnValue(false);

    render(<Index />);

    expect(
      screen.getByText(/Train with data\./i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Build with intent\./i)
    ).toBeInTheDocument();
  });

  it("shows sign in and register when logged out", () => {
    mockUseAuthStore.mockReturnValue(false);

    render(<Index />);

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Start logging")).toBeInTheDocument();
  });

  it("shows dashboard button when logged in", () => {
    mockUseAuthStore.mockReturnValue(true);

    render(<Index />);

    expect(screen.getByText("Go to dashboard")).toBeInTheDocument();
  });

  it("renders progression section", () => {
    mockUseAuthStore.mockReturnValue(false);

    render(<Index />);

    expect(screen.getByText("Every rep, in context.")).toBeInTheDocument();
    expect(screen.getByText("Bench Press")).toBeInTheDocument();
  });

  it("renders features section", () => {
    mockUseAuthStore.mockReturnValue(false);

    render(<Index />);

    expect(screen.getByText("Six things, done properly.")).toBeInTheDocument();
    expect(screen.getByText("Structured logging")).toBeInTheDocument();
    expect(screen.getByText("Trend detection")).toBeInTheDocument();
  });

  it("renders CTA section", () => {
    mockUseAuthStore.mockReturnValue(false);

    render(<Index />);

    expect(screen.getByText(/Add weight\./i)).toBeInTheDocument();
    expect(screen.getByText("Create your account")).toBeInTheDocument();
  });
});