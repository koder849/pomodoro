import { useEffect, useRef, useState } from 'react'
import { Clock3, Pause, Play, RefreshCw, Sparkles } from 'lucide-react'
import useSound from 'use-sound'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import startSfx from './assets/start.mp3'
import endSfx from './assets/end.mp3'

const THEMES = [
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Cool violets that channel twilight focus.',
    className: 'bg-theme-aurora',
  },
  {
    id: 'sunrise',
    name: 'Sunrise',
    description: 'Warm gradients to energise early sessions.',
    className: 'bg-theme-sunrise',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep blues for calm, late-night work.',
    className: 'bg-theme-midnight',
  },
]

const SESSION_RANGE = { min: 15, max: 60 }
const BREAK_RANGE = { min: 5, max: 30 }

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function getThemeClass(theme) {
  return THEMES.find((item) => item.id === theme)?.className ?? THEMES[0].className
}

function App() {
  const [sessionLength, setSessionLength] = useState(25 * 60)
  const [breakLength, setBreakLength] = useState(5 * 60)
  const [timeLeft, setTimeLeft] = useState(sessionLength)
  const [phase, setPhase] = useState('session')
  const [running, setRunning] = useState(false)
  const [theme, setTheme] = useState(THEMES[0].id)
  const intervalRef = useRef(null)
  const [playStart] = useSound(startSfx, { volume: 0.35 })
  const [playEnd] = useSound(endSfx, { volume: 0.4 })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    const themeClass = getThemeClass(theme)
    const backgroundClasses = THEMES.map((item) => item.className)
    document.body.classList.remove(...backgroundClasses)
    document.body.classList.add(themeClass)
    return () => {
      document.body.classList.remove(themeClass)
    }
  }, [theme])

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      return
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const isFocus = phase === 'session'
          const nextPhase = isFocus ? 'break' : 'session'
          const nextDuration = isFocus ? breakLength : sessionLength
            ; (isFocus ? playEnd : playStart)()
          setPhase(nextPhase)
          return nextDuration
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [running, phase, sessionLength, breakLength, playEnd, playStart])

  useEffect(() => {
    if (running) return
    const target = phase === 'session' ? sessionLength : breakLength
    setTimeLeft((current) => (current === target ? current : target))
  }, [sessionLength, breakLength, phase, running])

  const currentDuration = phase === 'session' ? sessionLength : breakLength
  const progress = currentDuration ? 1 - Math.max(0, timeLeft) / currentDuration : 0
  const progressDegrees = Math.min(359.9, Math.max(0, progress * 360))
  const sessionMinutes = Math.round(sessionLength / 60)
  const breakMinutes = Math.round(breakLength / 60)

  const handleStart = () => {
    if (!running) setRunning(true)
  }

  const handlePause = () => setRunning(false)

  const handleReset = () => {
    setRunning(false)
    setPhase('session')
    setTimeLeft(sessionLength)
  }

  const handleSessionChange = (value) => {
    const minutes = value[0]
    setSessionLength(minutes * 60)
  }

  const handleBreakChange = (value) => {
    const minutes = value[0]
    setBreakLength(minutes * 60)
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute -left-28 top-20 h-80 w-80 rounded-full bg-primary/35 blur-3xl md:h-96 md:w-96" />
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-accent/35 blur-[120px] md:h-80 md:w-80" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-secondary/40 blur-[140px] md:h-[420px] md:w-[420px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 pb-14 pt-16 sm:px-6 md:gap-12 lg:px-8">
        <Card className="border border-border/40 bg-background/60">
          <CardHeader className="flex flex-col gap-6 rounded-[2.4rem] bg-background/70 p-6 sm:p-8 md:flex-row md:items-center md:justify-between md:gap-10">
            <div className="space-y-5 md:max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary/80">
                <Sparkles className="h-4 w-4" />
                Flow timer
              </div>
              <div className="space-y-3">
                <CardTitle className="text-[clamp(2.1rem,4vw,3.1rem)] font-semibold leading-[1.05] tracking-tight">
                  Focus on the minutes that move you forward.
                </CardTitle>
                <CardDescription className="max-w-xl text-sm text-muted-foreground sm:text-base">
                  Tune the countdown, stay in the zone, and let subtle cues guide your
                  breaks.
                </CardDescription>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
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
                      className="flex min-w-[0] flex-1 flex-col items-start gap-1 rounded-2xl border border-transparent px-4 py-3 text-left text-sm font-medium leading-snug tracking-tight whitespace-normal break-words data-[state=active]:border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_16px_30px_rgba(79,70,229,0.32)]"
                    >
                      <span className="text-sm font-semibold sm:text-base">
                        {item.name}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground data-[state=active]:text-primary-foreground/80">
                        {item.description}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-11 rounded-2xl px-5">
                    Session cues
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader className="space-y-3">
                    <DialogTitle>Session cues</DialogTitle>
                    <DialogDescription>
                      Gentle nudges help you keep pace without breaking focus.
                    </DialogDescription>
                  </DialogHeader>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="rounded-2xl border border-border/40 bg-background/50 p-3.5 leading-relaxed">
                      ⏱️ <span className="ml-2 font-medium text-foreground">Start</span>{' '}
                      — begin each focus block with a soft tone and glow.
                    </li>
                    <li className="rounded-2xl border border-border/40 bg-background/50 p-3.5 leading-relaxed">
                      🌤️ <span className="ml-2 font-medium text-foreground">Swap</span>{' '}
                      — slide into restorative breaks right on schedule.
                    </li>
                    <li className="rounded-2xl border border-border/40 bg-background/50 p-3.5 leading-relaxed">
                      🎯 <span className="ml-2 font-medium text-foreground">Reset</span>{' '}
                      — fine-tune the timer anytime to match your next sprint.
                    </li>
                  </ul>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-10 p-6 sm:p-8 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
            <section className="flex flex-col items-center gap-8">
              <div className="relative w-full max-w-[28rem] overflow-hidden rounded-[2.5rem] border border-border/60 bg-card/70 p-8 shadow-[0_36px_60px_rgba(8,10,27,0.6)] backdrop-blur-xl sm:px-10 sm:py-12">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-accent/10" />
                <div className="relative flex flex-col items-center gap-10">
                  <div className="relative flex aspect-square w-full max-w-[18rem] items-center justify-center sm:max-w-[20rem]">
                    <div
                      className="absolute inset-0 rounded-full border border-border/80 bg-gradient-to-br from-background/60 via-background to-background/80 shadow-inner"
                      style={{
                        backgroundImage: `conic-gradient(hsl(var(--primary)) ${progressDegrees}deg, rgba(148, 163, 184, 0.18) ${progressDegrees}deg 360deg)`,
                      }}
                    />
                    <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full border border-border/60 bg-background/70 px-6 py-8 text-center shadow-[inset_0_0_36px_rgba(8,10,27,0.5)] backdrop-blur-xl sm:px-8 sm:py-10">
                      <span className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-muted-foreground">
                        <Clock3 className="h-4 w-4" />
                        {phase === 'session' ? 'Focus' : 'Break'}
                      </span>
                      <span className="mt-4 text-[clamp(3rem,10vw,4.2rem)] font-bold tracking-tight text-foreground">
                        {formatTime(timeLeft)}
                      </span>
                      <span className="mt-2 text-xs text-muted-foreground sm:text-sm">
                        {phase === 'session'
                          ? `Break arrives in ${formatTime(timeLeft)}`
                          : `Next focus block in ${formatTime(timeLeft)}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex w-full flex-wrap items-center justify-center gap-3 sm:gap-4">
                    <Button
                      size="lg"
                      onClick={handleStart}
                      disabled={running}
                      className="min-w-[140px] rounded-2xl px-6"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </Button>
                    <Button
                      variant="subtle"
                      size="lg"
                      onClick={handlePause}
                      disabled={!running}
                      className="min-w-[140px] rounded-2xl px-6"
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleReset}
                      className="min-w-[140px] rounded-2xl px-6"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex w-full flex-col gap-6">
              <div className="rounded-[2rem] border border-border/60 bg-background/60 p-6 shadow-[0_24px_50px_rgba(8,10,27,0.5)] backdrop-blur-xl sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                      Focus block
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
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
                    onValueChange={handleSessionChange}
                    aria-label="Session length in minutes"
                  />
                  <div className="mt-3 flex items-center justify-between text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
                    <span>{SESSION_RANGE.min}m</span>
                    <span>{SESSION_RANGE.max}m</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-border/60 bg-background/60 p-6 shadow-[0_24px_50px_rgba(8,10,27,0.5)] backdrop-blur-xl sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                      Break window
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
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
                    onValueChange={handleBreakChange}
                    aria-label="Break length in minutes"
                  />
                  <div className="mt-3 flex items-center justify-between text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
                    <span>{BREAK_RANGE.min}m</span>
                    <span>{BREAK_RANGE.max}m</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-border/60 bg-background/60 p-6 shadow-[0_24px_50px_rgba(8,10,27,0.5)] backdrop-blur-xl sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                      {/* Session Cues */}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
                      Session Cues
                    </h3>
                  </div>

                </div>
                <div className="mt-6">
                  {/* <Slider
                    min={BREAK_RANGE.min}
                    max={BREAK_RANGE.max}
                    step={1}
                    value={[breakMinutes]}
                    onValueChange={handleBreakChange}
                    aria-label="Break length in minutes"
                  />
                  <div className="mt-3 flex items-center justify-between text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">
                    <span>{BREAK_RANGE.min}m</span>
                    <span>{BREAK_RANGE.max}m</span>
                  </div> */}
                  <Button onClick className="rounded-full bg-secondary/40 px-4 py-2 text-xs font-medium text-foreground/80">
                    Info
                  </Button>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
