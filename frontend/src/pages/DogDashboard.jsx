import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

const TYPE_LABEL = { sleep: 'Sover', awake: 'Våken' }
const TYPE_ICON  = { sleep: '😴', awake: '🐾' }
const TYPE_COLOR = { sleep: 'var(--accent2)', awake: 'var(--success)' }
const OPPOSITE   = { sleep: 'awake', awake: 'sleep' }

export default function DogDashboard() {
  const { dogId } = useParams()
  const nav = useNavigate()
  const [dog, setDog] = useState(null)
  const [activeSession, setActiveSession] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [initMode, setInitMode] = useState('sleep')
  const [todaySessions, setTodaySessions] = useState([])
  const timerRef = useRef(null)

  useEffect(() => {
    fetchDog()
    fetchActive()
    fetchToday()
  }, [dogId])

  useEffect(() => {
    if (activeSession) {
      const start = new Date(activeSession.start_time).getTime()
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000))
      }, 1000)
    } else {
      clearInterval(timerRef.current)
      setElapsed(0)
    }
    return () => clearInterval(timerRef.current)
  }, [activeSession])

  async function fetchDog() {
    const r = await fetch(`/api/dogs/${dogId}`)
    if (r.ok) setDog(await r.json()); else nav('/')
  }
  async function fetchActive() {
    const r = await fetch(`/api/sessions/active/${dogId}`)
    if (r.ok) { const d = await r.json(); setActiveSession(d) }
  }
  async function fetchToday() {
    const today = new Date().toISOString().slice(0, 10)
    const r = await fetch(`/api/sessions/dog/${dogId}?date_filter=${today}`)
    if (r.ok) setTodaySessions(await r.json())
  }

  async function startTimer(type) {
    const r = await fetch('/api/sessions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dog_id: parseInt(dogId), type, start_time: new Date().toISOString() })
    })
    if (r.ok) { setActiveSession(await r.json()); fetchToday() }
  }

  // Stopp gjeldende → start automatisk motpart
  async function stopAndSwitch() {
    if (!activeSession) return
    const nextType = OPPOSITE[activeSession.type]
    const now = new Date().toISOString()
    await fetch(`/api/sessions/${activeSession.id}/stop`, { method: 'PATCH' })
    const r = await fetch('/api/sessions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dog_id: parseInt(dogId), type: nextType, start_time: now })
    })
    if (r.ok) setActiveSession(await r.json())
    fetchToday()
  }

  // Stopp alt – ingen ny økt
  async function stopAll() {
    if (!activeSession) return
    await fetch(`/api/sessions/${activeSession.id}/stop`, { method: 'PATCH' })
    setActiveSession(null)
    fetchToday()
  }

  if (!dog) return <div className="page"><p style={{ color: 'var(--text2)' }}>Laster...</p></div>

  const nextType = activeSession ? OPPOSITE[activeSession.type] : null

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/">Hunder</Link>
          </div>
          <h1>🐶 {dog.name}{dog.breed ? <span style={{ fontWeight: 400, fontSize: 16, color: 'var(--text2)', marginLeft: 8 }}>{dog.breed}</span> : null}</h1>
        </div>
      </div>

      {/* ── Timer-kort ────────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
        {activeSession ? (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, color: TYPE_COLOR[activeSession.type], marginBottom: 4 }}>
              {TYPE_ICON[activeSession.type]} {TYPE_LABEL[activeSession.type]}
            </div>

            <div className="timer-display" style={{ color: TYPE_COLOR[activeSession.type] }}>
              {formatDuration(elapsed)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
              {/* Hoved-knapp: bytt til motpart */}
              <button
                className="timer-btn-main"
                onClick={stopAndSwitch}
                style={{
                  background: TYPE_COLOR[nextType],
                  color: nextType === 'awake' ? '#000' : '#fff',
                  boxShadow: `0 0 20px ${TYPE_COLOR[nextType]}44`
                }}
              >
                {TYPE_ICON[nextType]} Start {TYPE_LABEL[nextType].toLowerCase()}
              </button>

              {/* Sekundær: stopp alt */}
              <button className="timer-btn-stop" onClick={stopAll}>
                ⏹ Stopp tid
              </button>
            </div>

            <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 12 }}>
              «Stopp tid» stopper uten å starte ny økt
            </p>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--text2)', marginBottom: 14, fontSize: 15 }}>
              Hva gjør {dog.name} nå?
            </p>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {['sleep', 'awake'].map(m => (
                <button
                  key={m}
                  className="timer-mode-btn"
                  onClick={() => setInitMode(m)}
                  style={{
                    background: initMode === m ? TYPE_COLOR[m] : 'var(--bg3)',
                    color: initMode === m ? (m === 'awake' ? '#000' : '#fff') : 'var(--text)',
                    borderColor: initMode === m ? TYPE_COLOR[m] : 'var(--border)',
                  }}
                >
                  {TYPE_ICON[m]}<br />{TYPE_LABEL[m]}
                </button>
              ))}
            </div>

            <button
              className="timer-btn-main btn-success"
              onClick={() => startTimer(initMode)}
            >
              ▶ Start
            </button>
          </>
        )}
      </div>

      {/* ── Navigasjon ────────────────────────────────────────────────────── */}
      <div className="grid4" style={{ marginBottom: 16 }}>
        {[
          { to: 'søvn',    icon: '😴', label: 'Søvnlogg' },
          { to: 'mat',     icon: '🍖', label: 'Matlogg' },
          { to: 'vet',     icon: '🏥', label: 'Veterinær' },
          { to: 'kunnskap',icon: '📚', label: 'Kunnskap' },
        ].map(item => (
          <Link key={item.to} to={`/dog/${dogId}/${item.to}`}>
            <div className="nav-card">
              <div className="icon">{item.icon}</div>
              <div className="label">{item.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Dagens aktivitet ──────────────────────────────────────────────── */}
      <div className="card">
        <h2 style={{ marginBottom: 14, fontSize: 16 }}>📅 Dagens aktivitet</h2>
        {todaySessions.length === 0 ? (
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Ingen registrerte økter i dag</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todaySessions.map(s => {
              const start = new Date(s.start_time)
              const end = s.end_time ? new Date(s.end_time) : null
              const dur = end ? Math.round((end - start) / 60000) : null
              const isActive = !s.end_time
              return (
                <div key={s.id} className="session-item" style={{
                  borderColor: isActive ? `${TYPE_COLOR[s.type]}44` : 'transparent'
                }}>
                  <span style={{ fontSize: 20 }}>{TYPE_ICON[s.type]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 600, color: TYPE_COLOR[s.type] }}>
                      {TYPE_LABEL[s.type]}
                    </span>
                    {isActive && (
                      <span style={{ marginLeft: 6, fontSize: 11, color: TYPE_COLOR[s.type], background: `${TYPE_COLOR[s.type]}22`, borderRadius: 4, padding: '1px 6px' }}>
                        pågår
                      </span>
                    )}
                    <div style={{ color: 'var(--text2)', fontSize: 13 }}>
                      {start.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                      {end && ` – ${end.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}`}
                      {dur !== null && ` · ${dur} min`}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
