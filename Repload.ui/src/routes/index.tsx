import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, TrendingUp, Activity, BarChart3, Dumbbell, Check, Plus, Zap } from "lucide-react";
import { useAuthStore } from "../auth";




export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Repload — Train with data. Build with intent." },
      { name: "description", content: "Repload is a muscle building tracker that turns every set, rep and kilo into a clear picture of your progression." },
      { property: "og:title", content: "Repload — Train with data" },
      { property: "og:description", content: "A strength tracker built around progressive overload. See your trends. Beat your last session." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <Hero />
      <Marquee />
      <ProgressionShowcase />
      <Features />
      <HowItWorks />
      <VolumeMath />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground">
            <Dumbbell className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-black tracking-tight">REPLOAD</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#progression" className="hover:text-foreground">Progression</a>
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#math" className="hover:text-foreground">The math</a>
        </nav>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
  {!isLoggedIn ? (
    <>
      <a
        href="/login"
        className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
      >
        Sign in
      </a>

      <a
        href="/register"
        className="inline-flex items-center gap-1 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        Start logging <ArrowUpRight className="h-4 w-4" />
      </a>
    </>
  ) : (
    <a
      href="/dashboard"
      className="inline-flex items-center gap-1 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
    >
      Go to dashboard <ArrowUpRight className="h-4 w-4" />
    </a>
  )}
</div>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Built around progressive overload
          </div>
          <h1 className="mt-6 font-display text-6xl font-black leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            Train with data.<br />
            <span className="text-primary">Build with intent.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Most apps just store your workouts. Repload reads them — surfacing volume trends, plateaus
            and strength gains so every session has a clear next move.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
  href="/register"
  className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90"
>
  Start your first log <ArrowUpRight className="h-4 w-4" />
</a>
            <a href="#progression" className="text-sm font-semibold text-foreground underline-offset-4 hover:underline">
              See progression in action →
            </a>
          </div>
          <div className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-8">
            <Stat value="+5%" label="Min. weekly overload" />
            <Stat value="3" label="Steps to log a set" />
            <Stat value="∞" label="Trends, per exercise" />
          </div>
        </div>
        <div className="relative lg:col-span-5">
          <div className="relative overflow-hidden rounded-sm border border-border">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-sm border border-border/80 bg-background/85 p-4 backdrop-blur">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
                <span>Today · Bench Press</span>
                <span className="text-primary">+8.2%</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2 font-mono-num">
                <span className="font-display text-3xl font-black">4,320</span>
                <span className="text-xs text-muted-foreground">kg total volume</span>
              </div>
              <div className="mt-3 flex h-8 items-end gap-1">
                {[40, 55, 48, 70, 62, 80, 92].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-primary/30"
                    style={{ height: `${h}%`, background: i === 6 ? "var(--primary)" : undefined }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-black text-primary">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Marquee() {
  const items = [
    "BENCH PRESS", "SQUAT", "DEADLIFT", "OVERHEAD PRESS", "ROW", "PULL-UP", "INCLINE DB", "RDL", "DIPS",
    "FRONT SQUAT", "HIP THRUST", "CHIN-UP", "LATERAL RAISE", "LEG PRESS",
  ];
  return (
    <div className="border-b border-border/60 bg-surface/40 py-5 overflow-hidden">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-display text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-12">
            {t}
            <span className="text-primary">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ProgressionShowcase() {
  const weeks = [2100, 2350, 2280, 2640, 2810, 2950, 3200, 3140, 3480, 3720, 3650, 4320];
  const max = Math.max(...weeks);
  return (
    <section id="progression" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-end gap-8 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary">01 — Progression</div>
            <h2 className="mt-3 font-display text-5xl font-black tracking-tight md:text-6xl">
              Every rep, in context.
            </h2>
          </div>
          <p className="text-lg text-muted-foreground lg:text-right">
            Repload compares today's volume against your last 6 sessions. Increases, plateaus and
            regressions are flagged automatically — no spreadsheet required.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-sm border border-border bg-surface p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Bench Press</div>
                <div className="mt-1 font-display text-2xl font-bold">12-week volume</div>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <TrendingUp className="h-3.5 w-3.5" /> Progressing
              </div>
            </div>
            <div className="mt-8 flex h-56 items-end gap-2">
              {weeks.map((v, i) => (
                <div key={i} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="font-mono-num text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">
                    {v}
                  </div>
                  <div
                    className="w-full rounded-sm bg-primary transition-all"
                    style={{
                      height: `${(v / max) * 100}%`,
                      opacity: i === weeks.length - 1 ? 1 : 0.35 + (i / weeks.length) * 0.5,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 font-mono-num text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>W1</span><span>W4</span><span>W8</span><span>W12</span>
            </div>
          </div>

          <div className="space-y-4">
            <InsightCard
              tag="Insight"
              title="+5.2% volume vs last week"
              body="Driven by an extra set at 85kg. Stay in this range for one more session before adding load."
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <InsightCard
              tag="Plateau watch"
              title="Overhead Press flat 3 weeks"
              body="Total volume held within 2% across sessions. Suggested: drop set or tempo work."
              icon={<Activity className="h-4 w-4" />}
              muted
            />
            <InsightCard
              tag="New PR"
              title="Deadlift 1RM est. 182kg"
              body="Calculated from 5×3 at 160kg using Epley formula."
              icon={<Zap className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function InsightCard({
  tag, title, body, icon, muted,
}: { tag: string; title: string; body: string; icon: React.ReactNode; muted?: boolean }) {
  return (
    <div className={`rounded-sm border p-5 ${muted ? "border-border bg-surface" : "border-primary/30 bg-primary/5"}`}>
      <div className={`flex items-center gap-2 text-xs uppercase tracking-widest ${muted ? "text-muted-foreground" : "text-primary"}`}>
        {icon} {tag}
      </div>
      <div className="mt-2 font-display text-lg font-bold leading-tight">{title}</div>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Features() {
  const items = [
    { icon: Dumbbell, title: "Structured logging", body: "Exercises, sets, reps, weight — captured cleanly in three taps." },
    { icon: BarChart3, title: "Volume analytics", body: "Sets × reps × weight, tracked per exercise and per muscle group." },
    { icon: TrendingUp, title: "Trend detection", body: "Progression, plateau or regression — flagged with a clear threshold." },
    { icon: Activity, title: "Per-exercise history", body: "Drill into any lift to see every session, every set, every PR." },
    { icon: Zap, title: "Estimated 1RM", body: "Epley-based estimates update as your working sets improve." },
    { icon: Check, title: "No noise", body: "No social feed. No streaks. No notifications. Just your training." },
  ];
  return (
    <section id="features" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-xs uppercase tracking-widest text-primary">02 — Features</div>
        <h2 className="mt-3 max-w-3xl font-display text-5xl font-black tracking-tight md:text-6xl">
          Six things, done properly.
        </h2>
        <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="group relative bg-background p-8 transition hover:bg-surface">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-surface text-primary transition group-hover:border-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              <ArrowUpRight className="absolute right-6 top-6 h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Log the set", body: "Pick the lift, enter reps and weight. Repeat for each set." },
    { n: "02", title: "Repload reads it", body: "Volume, intensity and est. 1RM are computed in the background." },
    { n: "03", title: "Train the trend", body: "Next session you see exactly where to push, hold or back off." },
  ];
  return (
    <section id="how" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-xs uppercase tracking-widest text-primary">03 — How it works</div>
        <h2 className="mt-3 font-display text-5xl font-black tracking-tight md:text-6xl">
          From set to signal.
        </h2>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-sm border border-border bg-surface p-8">
              <div className="font-mono-num text-sm text-primary">{s.n}</div>
              <h3 className="mt-4 font-display text-2xl font-bold">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VolumeMath() {
  return (
    <section id="math" className="border-b border-border/60 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary">04 — The math</div>
          <h2 className="mt-3 font-display text-5xl font-black tracking-tight md:text-6xl">
            One formula. Honest feedback.
          </h2>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Training volume is the most reliable indicator of progressive overload.
            Repload computes it for every session and compares it across time.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "≥ 5% volume increase → flagged as progression",
              "Within ±2% across 3 sessions → plateau",
              "Drop in volume → regression signal",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 text-primary" />
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative rounded-sm border border-border bg-surface p-10">
          <div className="font-mono-num text-xs uppercase tracking-widest text-muted-foreground">
            volume.ts
          </div>
          <div className="mt-6 font-display text-3xl font-black leading-tight md:text-4xl">
            Volume = <span className="text-primary">Sets</span> × <span className="text-primary">Reps</span> × <span className="text-primary">Weight</span>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-3 font-mono-num text-sm">
            <Box label="Sets" value="4" />
            <Box label="Reps" value="8" />
            <Box label="Weight" value="80kg" />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-sm border border-primary/40 bg-primary/10 p-4">
            <span className="text-xs uppercase tracking-widest text-primary">Session volume</span>
            <span className="font-mono-num font-display text-2xl font-black text-primary">2,560 kg</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-background p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-black">{value}</div>
    </div>
  );
}

function CTA() {
  return (
    <section id="cta" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <Plus className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-4 font-display text-5xl font-black tracking-tight md:text-7xl">
          Add weight.<br />Read the room.<br />
          <span className="text-primary">Repeat.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
          A muscle building tracker designed for people who care about getting stronger — not posting about it.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
  href="/register"
  className="inline-flex items-center gap-2 rounded-sm bg-primary px-7 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground transition hover:bg-primary/90"
>
  Create your account <ArrowUpRight className="h-4 w-4" />
</a>
          
          <a href="#progression" className="text-sm font-semibold text-foreground underline-offset-4 hover:underline">
            See a sample dashboard →
          </a>
        </div>
        
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-sm bg-primary text-primary-foreground">
            <Dumbbell className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="font-display font-black tracking-tight">REPLOAD</span>
          <span className="ml-3 text-xs text-muted-foreground">© 2026 · Built for lifters.</span>
        </div>
        <div className="flex gap-6 text-xs uppercase tracking-widest text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
  
}
export default Index;