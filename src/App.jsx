import { useEffect, useRef, useState } from "react";
import { Clock3, Pause, Play, RefreshCw, Sparkles } from "lucide-react";
import useSound from "use-sound";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import startSfx from "./assets/start.mp3";
import endSfx from "./assets/end.mp3";

const THEMES = [
  {
    id: "aurora",
    name: "Aurora",
    description: "Cool violets that channel twilight focus.",
    className: "bg-theme-aurora",
  },
  {
    id: "sunrise",
    name: "Sunrise",
    description: "Warm gradients to energize early sessions.",
    className: "bg-theme-sunrise",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep blues for calm, late-night work.",
    className: "bg-theme-midnight",
  },
];

const SESSION_RANGE = { min: 15, max: 60 };
const BREAK_RANGE = { min: 5, max: 30 };

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getThemeClass(theme) {
  return (
    THEMES.find((item) => item.id === theme)?.className ?? THEMES[0].className
  );
}

function App() {
  const [sessionLength, setSessionLength] = useState(25 * 60);
  const [breakLength, setBreakLength] = useState(5 * 60);
  const [timeLeft, setTimeLeft] = useState(sessionLength);
  const [phase, setPhase] = useState("session");
  const [running, setRunning] = useState(false);
  // const [theme, setTheme] = useState(THEMES[1].id);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    const iniitialValue = JSON.parse(saved);
    return iniitialValue || THEMES[1].id;
  })
  const intervalRef = useRef(null);
  const [playStart] = useSound(startSfx, { volume: 0.35 });
  const [playEnd] = useSound(endSfx, { volume: 0.4 });

  // Theme management
  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(theme));
    document.documentElement.setAttribute("data-theme", theme);
    const themeClass = getThemeClass(theme);
    const backgroundClasses = THEMES.map((item) => item.className);
    document.body.classList.remove(...backgroundClasses);
    document.body.classList.add(themeClass);
    return () => {
      document.body.classList.remove(themeClass);
    };
  }, [theme]);

  // Timer logic
  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const isFocus = phase === "session";
          const nextPhase = isFocus ? "break" : "session";
          const nextDuration = isFocus ? breakLength : sessionLength;
          (isFocus ? playEnd : playStart)();
          setPhase(nextPhase);
          return nextDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running, phase, sessionLength, breakLength, playEnd, playStart]);

  // Handlers
  const handleStart = () => {
    if (running) return;
    setRunning(true);
  };

  const handlePause = () => {
    if (!running) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
    setPhase("session");
    setTimeLeft(sessionLength);
  };

  // Display calculations
  const currentDuration = phase === "session" ? sessionLength : breakLength;
  const progress = currentDuration
    ? 1 - Math.max(0, timeLeft) / currentDuration
    : 0;
  const progressDegrees = Math.min(359.9, Math.max(0, progress * 360));
  const sessionMinutes = Math.round(sessionLength / 60);
  const breakMinutes = Math.round(breakLength / 60);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Soft glowing orbs */}
      <div className="pointer-events-none absolute -left-28 top-20 h-80 w-80 rounded-full bg-primary/35 blur-3xl md:h-96 md:w-96" />
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-accent/35 blur-[120px] md:h-80 md:w-80" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-secondary/40 blur-[140px] md:h-[420px] md:w-[420px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 pb-14 pt-16 sm:px-6 md:gap-12 lg:px-8">
        <Card className="rounded-[2rem] border border-border/40 bg-background/60">
          <CardHeader className="flex flex-col gap-6 rounded-[2rem] bg-background/70 p-6 sm:p-8 md:flex-row md:items-center md:justify-between md:gap-10">
            <div className="space-y-5 md:max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
                <Sparkles className="h-4 w-4" />
                Flow Timer
              </div>
              <div className="space-y-3">
                <CardTitle className="text-[clamp(2.1rem,4vw,3.1rem)] font-semibold leading-[1.05] tracking-tight">
                  Focus on the minutes that move you forward.
                </CardTitle>
                {/* <CardDescription className="max-w-xl text-sm text-muted-foreground sm:text-base">
                  Tune your countdown, stay in flow, and let subtle cues guide your
                  breaks.
                </CardDescription> */}
              </div>
            </div>

            {/* Theme Tabs */}
            <Tabs
              value={theme}
              onValueChange={setTheme}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-1 gap-2 bg-background/70 p-2 sm:inline-flex sm:h-auto sm:w-auto sm:items-stretch">
                {THEMES.map((item) => (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className="flex flex-col items-start gap-1 rounded-2xl border border-transparent px-4 py-3 text-left text-sm font-medium leading-snug tracking-tight whitespace-normal break-words data-[state=active]:border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <span className="text-sm font-semibold sm:text-base">
                      {item.name}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground data-[state=active]:text-primary-foreground/80">
                      {/* {item.description} */}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent className="flex flex-col gap-10 p-6 sm:p-8 lg:grid lg:grid-cols-[1fr_auto] lg:items-start">
            {/* TIMER */}
            <section className="flex flex-col items-center gap-6">
              <div className="relative w-full max-w-[26rem] overflow-hidden rounded-[2.5rem] border border-border/60 bg-card/70 p-10 shadow-[0_36px_60px_rgba(8,10,27,0.6)] backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-accent/10" />
                <div className="relative flex flex-col items-center gap-8">
                  {/* Circular timer */}
                  <div className="relative flex aspect-square w-full max-w-[18rem] items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full border border-border/80 bg-gradient-to-br from-background/60 via-background to-background/80 shadow-inner"
                      style={{
                        backgroundImage: `conic-gradient(hsl(var(--primary)) ${progressDegrees}deg, rgba(148,163,184,0.18) ${progressDegrees}deg 360deg)`,
                      }}
                    />
                    <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full border border-border/60 bg-background/70 shadow-[inset_0_0_36px_rgba(8,10,27,0.5)] backdrop-blur-xl">
                      <span className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-muted-foreground">
                        <Clock3 className="h-4 w-4" />
                        {phase === "session" ? "Focus" : "Break"}
                      </span>
                      <span className="mt-4 text-[clamp(3rem,10vw,4.5rem)] font-bold tracking-tight text-foreground">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>

                  {/* Play / Pause / Reset controls */}
                  <div className="flex items-center gap-4 mt-2">
                    <Button

                      onClick={running ? handlePause : handleStart}
                      className="flex items-center gap-2 rounded-full border border-primary/60 bg-primary px-6 py-5 font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:border-border/40 disabled:bg-background/30 disabled:text-muted-foreground"
                    >
                      {/* 
                      if running = true -> hide start icon and show pause icon 
                      else 
                         show start icon and hide pause icon 
                      */}
                      {running ? <Pause className="h-5 w-5 text-muted-foreground" /> : <Play className="h-5 w-5" />}
                      {running ? "Pause" : "Start" }
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleReset}
                      aria-label="Reset timer"
                      className="rounded-full border border-border/50 bg-background/40 hover:bg-background/70"
                    >
                      <RefreshCw className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Right-side controls */}
            <section className="flex w-full flex-col gap-6">
              {/* Session */}
              <div className="rounded-[2rem] border border-border/60 bg-background/60 p-6 shadow-md backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                      Focus Block
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-foreground">
                      {sessionMinutes} minutes
                    </h3>
                  </div>
                  <span className="rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary">
                    Session
                  </span>
                </div>
                <div className="mt-6">
                  <Slider
                    min={SESSION_RANGE.min}
                    max={SESSION_RANGE.max}
                    step={1}
                    value={[sessionMinutes]}
                    onValueChange={(val) => {
                      const next = val[0] * 60;
                      setSessionLength(next);
                      if (!running && phase === "session") {
                        setTimeLeft(next);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Break */}
              <div className="rounded-[2rem] border border-border/60 bg-background/60 p-6 shadow-md backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                      Break Window
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-foreground">
                      {breakMinutes} minutes
                    </h3>
                  </div>
                  <span className="rounded-full bg-secondary/40 px-4 py-2 text-xs font-medium text-foreground/80">
                    Recovery
                  </span>
                </div>
                <div className="mt-6">
                  <Slider
                    min={BREAK_RANGE.min}
                    max={BREAK_RANGE.max}
                    step={1}
                    value={[breakMinutes]}
                    onValueChange={(val) => {
                      const next = val[0] * 60;
                      setBreakLength(next);
                      if (!running && phase === "break") {
                        setTimeLeft(next);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Session Cues */}
              <div className="rounded-[2rem] border border-border/60 bg-background/60 p-6 shadow-md backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                      Guidance
                    </p>
                    <h3 className="mt-2 flex items-center gap-2 text-2xl font-semibold text-foreground">
                      <Sparkles className="h-5 w-5 text-primary" /> Session Cues
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                      Subtle reminders to stay in rhythm.
                    </p>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-2xl"
                      >
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Session Cues</DialogTitle>
                        <DialogDescription>
                          Gentle nudges help you stay focused without
                          distractions.
                        </DialogDescription>
                      </DialogHeader>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li>⏱️ Start — soft tone begins your session.</li>
                        <li>🌤️ Swap — transition into breaks seamlessly.</li>
                        <li>🎯 Reset — retune when needed.</li>
                      </ul>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
