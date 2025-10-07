import { useState, useEffect, useRef } from 'react'
import useSound from 'use-sound';
import startSfx from './assets/start.mp3';
import endSfx from './assets/end.mp3';
import './App.css'


function App() {
  let breakTime = 300;     // 5 min break
  let sessionTime = 1500;  // 25 min session
  const [count, setCount] = useState(sessionTime)
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const [isBreak, setIsBreak] = useState(false);
  const [playEnd] = useSound(endSfx);
  const [playStart] = useSound(startSfx);
  const [menu, setMenu] = useState(false);
  const imageUrl = 'https://images.unsplash.com/photo-1700388754304-67105a41fa83?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  function startTimer(duration, breakPhase) {
    setRunning(true)
    setIsBreak(breakPhase)

    // only reset count if starting fresh
    if (count === 0 || count === sessionTime || count === breakTime) {
      setCount(duration)
    }

    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)

          if (!breakPhase) {
            playEnd()
            startTimer(breakTime, true)
          } else {
            playStart()
            startTimer(sessionTime, false)
          }
          return breakPhase ? breakTime : sessionTime
        }
        return prev - 1
      })
    }, 1000)
  }

  function tick() {
    if (!running) {
      startTimer(isBreak ? breakTime : sessionTime, isBreak)
    }
  }

  function pause() {
    clearInterval(intervalRef.current)
    setRunning(false)
  }

  function reset() {
    clearInterval(intervalRef.current)
    setCount(sessionTime)
    setIsBreak(false)
    setRunning(false)
  }

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }


  return (
    <div className="app">
      <img src={imageUrl} className="background-image" alt="background" />
      <div className="dropdown">
        <button className="dropbtn" onClick={() => setMenu(!menu)}>Menu</button>
        <div className="dropdown-list">
          {menu &&
            (
              <ul>
                <li>
                  <button onClick={() => setMenu(false)}>Close Menu</button>
                </li>
                <li>
                  <button onClick={reset}>Reset Timer</button>
                </li>
              </ul>
            )
          }

        </div>
      </div>
      <div className='timer'>
        {isBreak ? <h2>Break</h2> : <h2>Session</h2>}
        <p className='time'>{formatTime(count)}</p>

        <div className="card">
          <button onClick={tick} disabled={running}>
            Start
          </button>
          <button onClick={pause} disabled={!running}>
            Pause
          </button>
          <button onClick={reset}>
            Reset
          </button>
        </div>
      </div>
    </div >
  )
}

export default App;
