import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

const TYPE_LABEL = { sleep: 'Sover', awake: 'Våken' }
const TYPE_ICON  = { sleep: '😴', awake: '🐾' }
const TYPE_COLOR = { sleep: 'var(--accent2)', awake: 'var(--success)' }

function toLocalInput(dateStr) {
  const d = new Date(dateStr)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function isLinked(a, b, toleranceSec = 60) {
  if (!a || !b) return false
  return Math.abs(new Date(a) - new Date(b)) <= toleranceSec * 1000
}

function formatDuration(minutes) {
  if (minutes === null || minutes === undefined) return null
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${minutes} min (${h}t ${m}m)` : `${minutes} min (${h}t)`
}

function calcDailySleepMinutes(sessions) {
  let totalMs = 0
  const now = new Date()
  for (const s of sessions) {
    if (s.type !== 'sleep') continue
    const start = new Date(s.start_time)
    const end   = s.end_time ? new Date(s.end_time) : now
    totalMs += end.getTime() - start.getTime()
  }
  return Math.round(totalMs / 60000)
}

export default function SleepTracker() {
  const { dogId } = useParams()
  const [sessions, setSessions] = useState([])
  const [allSessions, setAllSessions] = useState([])
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10))
  const [showModal, setShowModal] = useState(false)
  const [editSession, setEditSession] = useState(null)
  const [form, setForm] = useState({ type: 'sleep', start_time: '', end_time: '', notes: '' })
  const [cascadeInfo, setCascadeInfo] = useState(null)

  useEffect(() => { fetchSessions() }, [dogId, dateFilter])
  useEffect(() => { fetchAllSessions() }, [dogId])

  async function fetchSessions() {
    const r = await fetch(`/api/sessions/dog/${dogId}?date_filter=${dateFilter}`)
    if (r.ok) setSessions(await r.json())
  }
  async function fetchAllSessions() {
    const r = await fetch(`/api/sessions/dog/${dogId}`)
    if (r.ok) setAllSessions(await r.json())
  }

  function openNew() {
    setEditSession(null)
    setCascadeInfo(null)
    setForm({ type: 'sleep', start_time: toLocalInput(new Date()), end_time: '', notes: '' })
    setShowModal(true)
  }

  function openEdit(s) {
    setEditSession(s)
    setCascadeInfo(null)
    setForm({
      type: s.type,
      start_time: toLocalInput(s.start_time),
      end_time: s.end_time ? toLocalInput(s.end_time) : '',
      notes: s.notes || ''
    })
    setShowModal(true)
  }

  function onEndTimeChange(val) {
    setForm(f => ({ ...f, end_time: val }))
    if (!editSession || !val) { setCascadeInfo(null); return }
    const sorted = [...allSessions].sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    const idx = sorted.findIndex(s => s.id === editSession.id)
    if (idx < 0 || idx === sorted.length - 1) { setCascadeInfo(null); return }
    const next = sorted[idx + 1]
    if (isLinked(editSession.end_time, next.start_time)) {
      setCascadeInfo({ session: next, newStartTime: val })
    } else {
      setCascadeInfo(null)
    }
  }

  function onStartTimeChange(val) {
    setForm(f => ({ ...f, start_time: val }))
    if (!editSession || !val) { setCascadeInfo(null); return }
    const sorted = [...allSessions].sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    const idx = sorted.findIndex(s => s.id === editSession.id)
    if (idx <= 0) { setCascadeInfo(null); return }
    const prev = sorted[idx - 1]
    if (isLinked(prev.end_time, editSession.start_time)) {
      setCascadeInfo({ session: prev, newEndTime: val })
    } else {
      setCascadeInfo(null)
    }
  }

  async function save() {
    const body = {
      dog_id: parseInt(dogId),
      type: form.type,
      start_time: new Date(form.start_time).toISOString(),
      end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
      notes: form.notes || null
    }
    if (editSession) {
      await fetch(`/api/sessions/${editSession.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
      if (cascadeInfo) {
        const nb = cascadeInfo.session
        await fetch(`/api/sessions/${nb.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dog_id: nb.dog_id, type: nb.type,
            start_time: cascadeInfo.newStartTime ? new Date(cascadeInfo.newStartTime).toISOString() : new Date(nb.start_time).toISOString(),
            end_time: cascadeInfo.newEndTime ? new Date(cascadeInfo.newEndTime).toISOString() : nb.end_time,
            notes: nb.notes || null
          })
        })
      }
    } else {
      await fetch('/api/sessions/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
    }
    setShowModal(false)
    setCascadeInfo(null)
    fetchSessions()
    fetchAllSessions()
  }

  async function del(id) {
    if (!confirm('Slett økt?')) return
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    fetchSessions()
    fetchAllSessions()
  }

  const dailySleepMin = calcDailySleepMinutes(sessions)
  const sleepSessions = sessions.filter(s => s.type === 'sleep')
  const hasAnySleep = sleepSessions.length > 0

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/">Hunder</Link>
            <span>›</span>
            <Link to={`/dog/${dogId}`}>Dashbord</Link>
          </div>
          <h1>😴 Søvnlogg</h1>
        </div>
        <div className="page-header-actions">
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={{ width: 'auto', flex: '0 0 auto' }}
          />
          <button className="btn-primary" onClick={openNew}>+ Ny økt</button>
        </div>
      </div>

      {/* Dagsoppsummering søvn */}
      {hasAnySleep && (
        <div style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '14px 18px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{ fontSize: 22 }}>🌙</span>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 2 }}>
              Total søvn {dateFilter === new Date().toISOString().slice(0, 10) ? 'i dag' : dateFilter}
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--accent2)' }}>
              {formatDuration(dailySleepMin)}
            </div>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="empty-state">
          <div className="icon">😴</div>
          <p>Ingen økter for denne datoen</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.map((s, i) => {
            const start = new Date(s.start_time)
            const end   = s.end_time ? new Date(s.end_time) : null
            const dur   = end ? Math.round((end - start) / 60000) : null
            const isActive = !s.end_time
            const prev = sessions[i + 1]
            const linked = prev && isLinked(s.end_time, prev.start_time)
            return (
              <div key={s.id}>
                <div className="session-item" style={{
                  borderColor: isActive ? `${TYPE_COLOR[s.type]}55` : 'transparent',
                  background: isActive ? `${TYPE_COLOR[s.type]}08` : 'var(--bg3)'
                }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{TYPE_ICON[s.type]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: TYPE_COLOR[s.type] }}>
                      {TYPE_LABEL[s.type]}
                      {isActive && (
                        <span style={{ marginLeft: 6, fontSize: 11, background: `${TYPE_COLOR[s.type]}22`, color: TYPE_COLOR[s.type], borderRadius: 4, padding: '1px 6px' }}>
                          pågår
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>
                      {start.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                      {end ? ` – ${end.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}` : ' – pågår'}
                      {dur !== null && ` · ${formatDuration(dur)}`}
                    </div>
                    {s.notes && <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>{s.notes}</div>}
                  </div>
                  <div className="actions">
                    <button className="btn-secondary" onClick={() => openEdit(s)}>Rediger</button>
                    <button className="btn-danger"    onClick={() => del(s.id)}>Slett</button>
                  </div>
                </div>
                {linked && (
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0' }}>
                    <div style={{ width: 2, height: 8, background: 'var(--border)' }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2>{editSession ? 'Rediger økt' : 'Ny økt'}</h2>

            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="sleep">😴 Sover</option>
                <option value="awake">🐾 Våken</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start *</label>
                <input type="datetime-local" value={form.start_time} onChange={e => onStartTimeChange(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Slutt</label>
                <input type="datetime-local" value={form.end_time} onChange={e => onEndTimeChange(e.target.value)} />
              </div>
            </div>

            {cascadeInfo && (
              <div style={{
                background: 'rgba(108,143,255,.12)', border: '1px solid var(--accent)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14,
                display: 'flex', gap: 8, alignItems: 'center'
              }}>
                <span>🔗</span>
                <span>
                  Nabo-økt ({TYPE_ICON[cascadeInfo.session.type]} {TYPE_LABEL[cascadeInfo.session.type]}) er koblet og justeres automatisk.
                </span>
              </div>
            )}

            <div className="form-group">
              <label>Notater</label>
              <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Valgfritt" />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Avbryt</button>
              <button className="btn-primary" onClick={save}>
                {cascadeInfo ? 'Lagre (2 økter)' : 'Lagre'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
