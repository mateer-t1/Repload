import {
  createFileRoute,
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  ChevronRight,
  Dumbbell,
  LineChart as LineChartIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  Target,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { getDashboard, type DashboardData } from "../lib/api";
import { logout } from "../lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Repload" },
      {
        name: "description",
        content:
          "Your training dashboard: weekly volume, PRs, muscle group balance and the next session plan.",
      },
    ],
  }),
  component: Dashboard,
});

export function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate({ to: "/login" });
      return;
    }

    getDashboard()
      .then(setData)
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard"
        );
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <p className="text-destructive">
          {error || "Could not load dashboard"}
        </p>
      </div>
    );
  }

  const weekTotal = data.weekVolume.reduce((a, b) => a + b.volume, 0);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <div className="mx-auto flex max-w-[1500px]">
        <Sidebar sessionsThisWeek={data.weeklySessions} />

        <main className="flex-1 min-w-0">
          <TopBar username={data.username} />

          <div className="px-8 py-8 space-y-8">
            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <Header data={data} weekTotal={weekTotal} />
            <StatGrid data={data} weekTotal={weekTotal} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <VolumeChart
                weekVolume={data.weekVolume}
                weekTotal={weekTotal}
                volumeChange={data.volumeChange}
              />
              <ExerciseBalance exerciseSets={data.exerciseSets} />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <RecentSessions sessions={data.recentSessions} />
              <RightColumn
                records={data.records}
                nextSession={data.nextSession}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// SIDEBAR  

function Sidebar({
}: {
  sessionsThisWeek: number;
}) {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const nav = [
    { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { to: "/workouts", icon: Dumbbell, label: "Workouts" },
    { to: "/progression", icon: LineChartIcon, label: "Progression" },
    { to: "/records", icon: Trophy, label: "Records" },
    { to: "/calendar", icon: Calendar, label: "Calendar" },
  ] as const;

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/60 bg-card/30 px-4 py-6 lg:flex">
      <Link to="/" className="mb-10 flex items-center gap-2 px-2 cursor-pointer">
        <div className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground">
          <Dumbbell className="h-4 w-4" />
        </div>
        <span className="font-display text-lg font-black">REPLOAD</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

// TOP BAR

function TopBar({  }: { username: string }) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-40 flex items-center justify-end gap-4 border-b bg-background/80 px-8 py-3 backdrop-blur-xl">
      <Link
        to="/calendar"
        className="hidden md:flex items-center gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <Calendar className="h-4 w-4" />
        This week
      </Link>
      <Link
        to="/workouts"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Log session
      </Link>

      <button
        onClick={() => {
          logout();
          navigate({ to: "/login", replace: true });
        }}
        className="text-sm text-muted-foreground cursor-pointer"
      >
        Log out
      </button>

      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground cursor-pointer">
        You
      </div>
    </div>
  );
}

// HEADER  

function Header({
  data,
  weekTotal,
}: {
  data: DashboardData;
  weekTotal: number;
}) {
  return (
    <div>
      <h1 className="text-3xl font-black">Welcome back, {data.username}</h1>
      <p className="text-sm text-muted-foreground">
        Total volume:{" "}
        <span className="text-primary font-medium">
          {weekTotal.toLocaleString()} kg
        </span>
      </p>
    </div>
  );
}

// STAT GRID

function StatGrid({
  data,
  weekTotal,
}: {
  data: DashboardData;
  weekTotal: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div className="rounded-xl border p-4">
        <p>Weekly volume</p>
        <p className="text-xl font-bold">
          {weekTotal.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// VOLUME CHART

function VolumeChart({
  weekVolume,
  weekTotal,
  volumeChange,
}: {
  weekVolume: DashboardData["weekVolume"];
  weekTotal: number;
  volumeChange: string | null;
}) {
  const maxV = Math.max(
    ...weekVolume.map((d) => Number(d.volume) || 0),
    1
  );

  return (
    <div className="xl:col-span-2 rounded-xl border p-6">
      <div className="flex justify-between">
        <h2 className="font-bold">Weekly volume</h2>
        <div className="text-right">
          <div className="font-bold">
            {weekTotal.toLocaleString()} kg
          </div>
          {volumeChange && (
            <div className="text-xs text-primary">
              {volumeChange}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex h-56 items-end gap-3 border-b border-border/60 pb-2">
        {weekVolume.map((d) => {
          const volume = Number(d.volume) || 0;

          const h =
            volume <= 0
              ? 6
              : Math.max(20, (volume / maxV) * 100);

          return (
            <div
              key={d.day}
              className="flex flex-1 flex-col items-center"
            >
              <div className="relative flex h-full w-full items-end">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    volume <= 0
                      ? "bg-muted/30"
                      : "bg-primary"
                  }`}
                  style={{
                    height: `${h}%`,
                    minHeight:
                      volume <= 0 ? "6px" : "20px",
                  }}
                />
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                {d.day}
              </div>

              <div className="text-[10px] text-muted-foreground">
                {d.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// EXERCISE BALANCE

function ExerciseBalance({
  exerciseSets,
}: {
  exerciseSets: DashboardData["exerciseSets"];
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">
            Exercise balance
          </h2>
          <p className="text-sm text-muted-foreground">
            Your sets this week by exercise
          </p>
        </div>
        <Target className="h-4 w-4 text-muted-foreground" />
      </div>

      {exerciseSets.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No sets logged this week yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {exerciseSets.map((m) => {
            const pct = Math.min(
              100,
              (m.sets / m.target) * 100
            );
            const over = m.sets >= m.target;

            return (
              <div key={m.name}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-foreground">
                    {m.name}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    <span
                      className={
                        over
                          ? "text-primary"
                          : "text-amber-400"
                      }
                    >
                      {m.sets}
                    </span>{" "}
                    sets
                  </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                  <div
                    className={`h-full ${
                      over
                        ? "bg-primary"
                        : "bg-amber-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// RECENT SESSIONS

function RecentSessions({
  sessions,
}: {
  sessions: DashboardData["recentSessions"];
}) {
  return (
    <div className="xl:col-span-2 rounded-xl border border-border/60 bg-card/40">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <h2 className="font-display text-lg font-bold">
            Recent sessions
          </h2>
          <p className="text-sm text-muted-foreground">
            Your last logged workouts
          </p>
        </div>
        <Link
          to="/workouts"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
        >
          View all{" "}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-muted-foreground">
          No sessions yet.{" "}
          <Link
            to="/workouts"
            className="text-primary hover:underline cursor-pointer"
          >
            Log your first workout
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border/60">
          {sessions.map((s, i) => (
            <div
              key={i}
              className="grid grid-cols-12 items-center gap-4 px-6 py-4 transition hover:bg-muted/20"
            >
              <div className="col-span-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {s.day}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Timer className="h-3 w-3" /> {s.duration}
                </div>
              </div>

              <div className="col-span-5">
                <div className="font-display font-bold">
                  {s.title}
                </div>
                <div className="mt-1 truncate text-xs text-muted-foreground">
                  {s.exercises.length > 0
                    ? s.exercises.join(" · ")
                    : "No sets logged"}
                </div>
              </div>

              <div className="col-span-2 text-right">
                <div className="font-mono-num text-sm font-bold">
                  {s.volume > 0
                    ? s.volume.toLocaleString()
                    : "—"}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  kg volume
                </div>
              </div>

              <div className="col-span-2 text-right">
                {s.prs > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    <Trophy className="h-3 w-3" /> {s.prs} PR
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    —
                  </span>
                )}
              </div>

              <div className="col-span-1 text-right">
                <button className="rounded p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground cursor-pointer">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// RIGHT COLUMN

function RightColumn({
  records,
  nextSession,
}: {
  records: DashboardData["records"];
  nextSession: DashboardData["nextSession"];
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/60 bg-card/40 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">
              Personal records
            </h2>
            <p className="text-sm text-muted-foreground">
              Your best lifts (weight × reps)
            </p>
          </div>
          <Trophy className="h-4 w-4 text-primary" />
        </div>

        {records.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Log sets to track your personal bests.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {records.map((p) => (
              <div
                key={p.lift}
                className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/40 p-3"
              >
                <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">
                    {p.lift}
                  </div>
                  <div className="font-mono-num text-xs text-muted-foreground">
                    {p.weight} × {p.reps}
                  </div>
                </div>
                <span className="font-mono-num text-xs text-primary">
                  {p.delta} kg
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/40 to-card/40 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary">
              Latest session
            </div>
            <h2 className="mt-1 font-display text-xl font-black">
              {nextSession?.title ?? "No sessions yet"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {nextSession?.when ??
                "Create a workout to get started"}
            </p>
          </div>
          <Dumbbell className="h-5 w-5 text-primary" />
        </div>

        {nextSession &&
        nextSession.exercises.length > 0 ? (
          <div className="mt-5 space-y-2">
            {nextSession.exercises.map((e) => (
              <div
                key={e.name}
                className="flex items-center justify-between rounded-md bg-background/40 px-3 py-2 text-sm"
              >
                <span className="text-foreground">
                  {e.name}
                </span>
                <span className="font-mono-num text-xs text-muted-foreground">
                  {e.scheme} ·{" "}
                  <span className="text-foreground">
                    {e.target}
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">
            Your last workout's exercises will show here.
          </p>
        )}

        <Link
          to="/workouts"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 cursor-pointer"
        >
          Go to workouts{" "}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
