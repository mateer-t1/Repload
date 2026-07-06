export type WeekVolumeItem = {
  d: string;
  v: number;
  label: string;
};

export type MuscleGroup = {
  name: string;
  sets: number;
  target: number;
};

export type Session = {
  day: string;
  title: string;
  duration: string;
  volume: number;
  prs: number;
  exercises: string[];
};

export type PR = {
  lift: string;
  weight: string;
  reps: number;
  delta: string;
};

export type NextSession = {
  title: string;
  when: string;
  exercises: {
    name: string;
    scheme: string;
    target: string;
  }[];
};

export type DashboardData = {
  weekVolume: WeekVolumeItem[];
  muscleSplit: MuscleGroup[];
  recentSessions: Session[];
  prs: PR[];
  nextSession: NextSession;
};