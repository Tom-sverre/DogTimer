import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function VetAppointments() {
  const { dogId } = useParams()
  const [dog, setDog]         = useState(null)
  const [appts, setAppts]     = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editAppt, setEditAppt]   = useState(null)
  const [filter, setFilter]   = useState('kommende')
  const [msg, setMsg]         = useState('')
  const [form, setForm]       = useState({ title: '', date: '', vet_name: '', location: '', notes: '' })

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  const fetchAll = useCallback(async () => {
    const [rd, ra] = await Promise.all([
      fetch(`/api/dogs/${dogId}`),
      fetch(`/api/vet/dog/${dogId}`)
    ])
    if (rd.ok) setDog(await rd.json())
    if (ra.ok) setAppts(await ra.json())
  }, [dogId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Konverter UTC ISO til datetime-local streng (for input-feltet)
  function toLocalInput(utcStr) {
    if (!utcStr) return ''
    const d = new Date(utcStr)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 16)
  }

  function openNew() {
    setEditAppt(null)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    setForm({
      title: '', date: toLocalInput(tomorrow.toISOString()),
      vet_name: '', location: '', notes: ''
    })
    setShowModal(true)
  }

  function openEdit(appt, e) {
    e?.stopPropagation()
    setEditAppt(appt)
    setForm({
      title:    appt.title,
      date:     toLocalInput(appt.date),
      vet_name: appt.vet_name  || '',
      location: appt.location  || '',
      notes:    appt.notes     || ''
    })
    setShowModal(true)
  }

  async function save() {
    if (!form.title.trim() || !form.date) { flash('Tittel og dato er påkrevd'); return }
    const body = {
      dog_id:   parseInt(dogId),
      title:    form.title.trim(),
      date:     new Date(form.date).toISOString(),
      vet_name: form.vet_name.trim() || null,
      location: form.location.trim() || null,
      notes:    form.notes.trim()    || null,
    }
    const url    = editAppt ? `/api/vet/${editAppt.id}` : '/api/vet/'
    const method = editAppt ? 'PUT' : 'POST'
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (r.ok) {
      setShowModal(false)
      flash(editAppt ? 'Oppdatert!' : 'Lagt til!')
      fetchAll()
    } else {
      flash('Feil ved lagring')
    }
  }

  async function del(id, e) {
    e?.stopPropagation()
    if (!confirm('Slette denne veterinærtimen?')) return
    await fetch(`/api/vet/${id}`, { method: 'DELETE' })
    flash('Slettet')
    fetchAll()
  }

  const now      = new Date()
  const upcoming = appts
    .filter(a => new Date(a.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  const past     = appts
    .filter(a => new Date(a.date) < now)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const filtered = filter === 'kommende' ? upcoming : past

  if (!dog) return <div className="page"><p style={{ color: 'var(--text2)' }}>Laster...</p></div>

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/">Hunder</Link>
            <span>›</span>
            <Link to={`/dog/${dogId}`}>Dashbord</Link>
          </div>
          <h1>🏥 Veterinær – {dog.name}</h1>
        </div>
        <div className="page-header-actions">
          {appts.length > 0 && (
            <a href={`/api/vet/dog/${dogId}/export/ical`} download="veterinærtimer.ics">
              <button className="btn-secondary">📅 Eksporter alle</button>
            </a>
          )}
          <button className="btn-primary" onClick={openNew}>+ Ny time</button>
        </div>
      </div>

      {msg && (
        <div style={{
          background: 'var(--success)', color: '#000', borderRadius: 8,
          padding: '10px 14px', marginBottom: 14, fontWeight: 500
        }}>
          {msg}
        </div>
      )}

      {/* Filterfaner */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={filter === 'kommende' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setFilter('kommende')}
        >
          🔜 Kommende ({upcoming.length})
        </button>
        <button
          className={filter === 'tidligere' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setFilter('tidligere')}
        >
          📋 Tidligere ({past.length})
        </button>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🏥</div>
          <p>
            {filter === 'kommende'
              ? 'Ingen kommende veterinærtimer'
              : 'Ingen tidligere veterinærtimer'}
          </p>
          {filter === 'kommende' && (
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={openNew}>
              + Legg til time
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(appt => {
            const dt     = new Date(appt.date)
            const isPast = dt < now
            return (
              <div key={appt.id} className="card" style={{
                borderLeft: `4px solid ${isPast ? 'var(--text2)' : 'var(--accent)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                      {isPast ? '📋' : '🏥'} {appt.title}
                    </div>
                    <div style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 2 }}>
                      🗓️ {dt.toLocaleString('nb-NO', {
                        weekday: 'long', day: 'numeric', month: 'long',
                        year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                    {appt.vet_name && (
                      <div style={{ color: 'var(--text2)', fontSize: 13 }}>
                        👨‍⚕️ {appt.vet_name}
                      </div>
                    )}
                    {appt.location && (
                      <div style={{ color: 'var(--text2)', fontSize: 13 }}>
                        📍 {appt.location}
                      </div>
                    )}
                    {appt.notes && (
                      <div style={{
                        color: 'var(--text2)', fontSize: 13,
                        marginTop: 6, fontStyle: 'italic'
                      }}>
                        {appt.notes}
                      </div>
                    )}
                    <div style={{ marginTop: 10 }}>
                      <a href={`/api/vet/dog/${dogId}/export/ical`} download="veterinærtime.ics">
                        <button className="btn-secondary" style={{ fontSize: 13, padding: '6px 12px' }}>
                          📅 Legg til iPhone-kalender
                        </button>
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '5px 10px', fontSize: 12, minHeight: 32 }}
                      onClick={e => openEdit(appt, e)}
                    >✏️</button>
                    <button
                      className="btn-danger"
                      style={{ padding: '5px 10px', fontSize: 12, minHeight: 32 }}
                      onClick={e => del(appt.id, e)}
                    >🗑️</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2>{editAppt ? 'Rediger veterinærtime' : 'Ny veterinærtime'}</h2>

            <div className="form-group">
              <label>Tittel *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="F.eks. Vaksinering, Årskontroll"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Dato og tid *</label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Veterinær / Klinikk</label>
              <input
                value={form.vet_name}
                onChange={e => setForm(f => ({ ...f, vet_name: e.target.value }))}
                placeholder="F.eks. Dr. Hansen"
              />
            </div>

            <div className="form-group">
              <label>Sted</label>
              <input
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Adresse eller klinikkens navn"
              />
            </div>

            <div className="form-group">
              <label>Notater</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Ekstra notater..."
                style={{ minHeight: 80 }}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Avbryt</button>
              <button className="btn-primary" onClick={save}>Lagre</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
