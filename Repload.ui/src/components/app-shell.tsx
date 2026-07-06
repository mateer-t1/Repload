import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  BarChart3,
  Calendar,
  Dumbbell,
  LineChart,
  Plus,
  Target,
  Trophy,
} from "lucide-react";
import { logout } from "../lib/api";

const NAV = [
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/workouts", icon: Dumbbell, label: "Workouts" },
  { to: "/progression", icon: LineChart, label: "Progression" },
  { to: "/records", icon: Trophy, label: "Records" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
] as const;

function Sidebar() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col border-r border-border/60 bg-card/30 px-4 py-6 sticky top-0">
      <Link to="/" className="flex items-center gap-2 px-2 mb-10 cursor-pointer">
        <div className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground">
          <Dumbbell className="h-4 w-4" />
        </div>
        <span className="font-display font-black tracking-tight">
          REPLOAD
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition cursor-pointer",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              ].join(" ")}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function TopBar({
  cta,
  onCtaClick,
  onLogout,
}: {
  cta?: { label: string; icon?: typeof Plus };
  onCtaClick?: () => void;
  onLogout?: () => void;
}) {
  const Icon = cta?.icon ?? Plus;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur">
      <Link
        to="/calendar"
        className="hidden md:flex items-center gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <Calendar className="h-4 w-4" />
        This week
      </Link>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onCtaClick}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90 cursor-pointer"
        >
          <Icon className="h-4 w-4" />
          {cta?.label ?? "Log session"}
        </button>

        <button
          onClick={onLogout}
          className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
        >
          Sign out
        </button>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-medium cursor-pointer">
          You
        </div>
      </div>
    </header>
  );
}

export function AppShell({
  children,
  cta,
  onCtaClick,
}: {
  children: ReactNode;
  cta?: { label: string; icon?: typeof Plus };
  onCtaClick?: () => void;
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <div className="mx-auto flex max-w-[1500px]">
        <Sidebar />

        <main className="flex-1 min-w-0">
          <TopBar
            cta={cta}
            onCtaClick={onCtaClick}
            onLogout={handleLogout}
          />

          <div className="px-6 py-6 space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

type TabItem = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  tabs,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tabs?: TabItem[];
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl md:text-4xl font-black">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {tabs && (
        <div className="flex items-center gap-1 rounded-md border border-border/60 bg-card/30 p-1 text-xs">
          {tabs.map((t) => (
            <button
              key={t.label}
              onClick={t.onClick}
              className={[
                "px-3 py-1.5 rounded transition cursor-pointer",
                t.active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}