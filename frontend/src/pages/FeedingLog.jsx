import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'

const FOOD_TYPES = ['Tørr', 'Våt', 'Hjemmelaget', 'Godbit', 'Annet']
const FOOD_ICONS = { 'Tørr': '🥣', 'Våt': '🍲', 'Hjemmelaget': '🍗', 'Godbit': '🦴', 'Annet': '🍽️' }

function toLocalInput(utcStr) {
  if (!utcStr) return ''
  const d = new Date(utcStr)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16)
}

export default function FeedingLog() {
  const { dogId } = useParams()
  const [dog, setDog]           = useState(null)
  const [feedings, setFeedings] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editFeeding, setEditFeeding] = useState(null)
  const [msg, setMsg]           = useState('')
  const [form, setForm]         = useState({
    food_type: 'Tørr', amount: '', unit: '', time: '', notes: ''
  })

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  const fetchAll = useCallback(async () => {
    const [rd, rf] = await Promise.all([
      fetch(`/api/dogs/${dogId}`),
      fetch(`/api/feedings/dog/${dogId}`)
    ])
    if (rd.ok) setDog(await rd.json())
    if (rf.ok) setFeedings(await rf.json())
  }, [dogId])

  useEffect(() => { fetchAll() }, [fetchAll])

  function nowLocal() {
    const now = new Date()
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 16)
  }

  function openNew() {
    setEditFeeding(null)
    setForm({ food_type: 'Tørr', amount: '', unit: '', time: nowLocal(), notes: '' })
    setShowModal(true)
  }

  function openEdit(feeding, e) {
    e?.stopPropagation()
    setEditFeeding(feeding)
    setForm({
      food_type: feeding.food_type || 'Tørr',
      amount:    feeding.amount != null ? String(feeding.amount) : '',
      unit:      feeding.unit   || '',
      time:      toLocalInput(feeding.time),
      notes:     feeding.notes  || '',
    })
    setShowModal(true)
  }

  async function save() {
    if (!form.time) { flash('Tidspunkt er påkrevd'); return }
    const body = {
      dog_id:    parseInt(dogId),
      food_type: form.food_type || null,
      amount:    form.amount ? parseFloat(form.amount) : null,
      unit:      form.unit.trim() || null,
      time:      new Date(form.time).toISOString(),
      notes:     form.notes.trim() || null,
    }
    const url    = editFeeding ? `/api/feedings/${editFeeding.id}` : '/api/feedings/'
    const method = editFeeding ? 'PUT' : 'POST'
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (r.ok) {
      setShowModal(false)
      flash(editFeeding ? 'Oppdatert!' : 'Lagt til!')
      fetchAll()
    } else {
      flash('Feil ved lagring')
    }
  }

  async function del(id, e) {
    e?.stopPropagation()
    if (!confirm('Slette dette måltidet?')) return
    await fetch(`/api/feedings/${id}`, { method: 'DELETE' })
    flash('Slettet')
    fetchAll()
  }

  // Group by date
  const grouped = {}
  feedings.forEach(f => {
    const date = new Date(f.time).toLocaleDateString('nb-NO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(f)
  })

  // Today's feedings
  const todayStr = new Date().toLocaleDateString('nb-NO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const todayFeedings = grouped[todayStr] || []

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
          <h1>🍖 Matlogg – {dog.name}</h1>
        </div>
        <button className="btn-primary" onClick={openNew}>+ Legg til måltid</button>
      </div>

      {msg && (
        <div style={{
          background: 'var(--success)', color: '#000', borderRadius: 8,
          padding: '10px 14px', marginBottom: 14, fontWeight: 500
        }}>
          {msg}
        </div>
      )}

      {/* Today summary */}
      <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>{todayFeedings.length}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600 }}>måltider i dag</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {todayFeedings.map(f => (
              <span key={f.id} style={{
                background: '#fef3c7', color: '#d97706',
                borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 700
              }}>
                {FOOD_ICONS[f.food_type] || '🍽️'} {f.food_type}{f.amount ? ` · ${f.amount}${f.unit ? ' ' + f.unit : ''}` : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* History */}
      {feedings.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>🍖</div>
          <p>Ingen måltider registrert ennå</p>
          <button className="btn-primary" style={{ marginTop: 16 }} onClick={openNew}>
            + Legg til første måltid
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: 'var(--text2)',
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8
            }}>
              {date}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(f => (
                <div key={f.id} className="card" style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px'
                }}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>
                    {FOOD_ICONS[f.food_type] || '🍽️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                      {f.food_type || 'Ukjent'}
                      {f.amount != null && (
                        <span style={{ marginLeft: 8, fontWeight: 400, fontSize: 13 }}>
                          {f.amount}{f.unit ? ' ' + f.unit : ''}
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'var(--text2)', fontSize: 13 }}>
                      {new Date(f.time).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
                      {f.notes && ` · ${f.notes}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '5px 10px', fontSize: 12, minHeight: 32 }}
                      onClick={e => openEdit(f, e)}
                    >✏️</button>
                    <button
                      className="btn-danger"
                      style={{ padding: '5px 10px', fontSize: 12, minHeight: 32 }}
                      onClick={e => del(f.id, e)}
                    >🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2>{editFeeding ? 'Rediger måltid' : 'Legg til måltid'}</h2>

            <div className="form-group">
              <label>Type mat</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {FOOD_TYPES.map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => setForm(f => ({ ...f, food_type: t }))}
                    style={{
                      padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700,
                      border: `1.5px solid ${form.food_type === t ? '#f59e0b' : 'var(--border)'}`,
                      background: form.food_type === t ? '#fef3c7' : 'transparent',
                      color: form.food_type === t ? '#d97706' : 'var(--text2)',
                      cursor: 'pointer',
                    }}
                  >
                    {FOOD_ICONS[t]} {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Mengde</label>
                <input
                  type="number" min="0" step="any"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="F.eks. 200"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Enhet</label>
                <input
                  value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  placeholder="g, ml, porsjon..."
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tidspunkt *</label>
              <input
                type="datetime-local"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Notater</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Ekstra notater..."
                style={{ minHeight: 70 }}
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
