import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MainDashboard() {
  const [dogs, setDogs] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editDog, setEditDog] = useState(null)
  const [form, setForm] = useState({ name: '', breed: '', birth_date: '' })
  const nav = useNavigate()

  useEffect(() => { fetchDogs() }, [])

  async function fetchDogs() {
    const r = await fetch('/api/dogs/')
    setDogs(await r.json())
  }

  function openNew() {
    setEditDog(null)
    setForm({ name: '', breed: '', birth_date: '' })
    setShowModal(true)
  }

  function openEdit(dog, e) {
    e.stopPropagation()
    setEditDog(dog)
    setForm({ name: dog.name, breed: dog.breed || '', birth_date: dog.birth_date || '' })
    setShowModal(true)
  }

  async function save() {
    if (!form.name.trim()) return
    const body = JSON.stringify(form)
    if (editDog) {
      await fetch(`/api/dogs/${editDog.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body })
    } else {
      await fetch('/api/dogs/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    }
    setShowModal(false)
    fetchDogs()
  }

  async function deleteDog(dog, e) {
    e.stopPropagation()
    if (!confirm(`Slett ${dog.name}? All data slettes permanent.`)) return
    await fetch(`/api/dogs/${dog.id}`, { method: 'DELETE' })
    fetchDogs()
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>🐾 Mine hunder</h1>
        <div className="page-header-actions">
          <button className="btn-primary" onClick={openNew}>+ Legg til hund</button>
        </div>
      </div>

      {dogs.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🐕</div>
          <p>Ingen hunder registrert ennå.<br />Legg til din første hund!</p>
          <button className="btn-primary" style={{ marginTop: 20, padding: '12px 28px' }} onClick={openNew}>
            + Legg til hund
          </button>
        </div>
      ) : (
        <div className="grid3">
          {dogs.map(dog => (
            <div
              key={dog.id}
              className="card"
              style={{ cursor: 'pointer', transition: 'all .15s', userSelect: 'none' }}
              onClick={() => nav(`/dog/${dog.id}`)}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ fontSize: 44, textAlign: 'center', marginBottom: 10 }}>🐶</div>
              <h2 style={{ textAlign: 'center', fontSize: 18, marginBottom: 4 }}>{dog.name}</h2>
              {dog.breed && (
                <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 13 }}>{dog.breed}</p>
              )}
              {dog.birth_date && (
                <p style={{ textAlign: 'center', color: 'var(--text2)', fontSize: 13 }}>Født: {dog.birth_date}</p>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'center' }}>
                <button
                  className="btn-secondary"
                  style={{ fontSize: 13, padding: '8px 14px' }}
                  onClick={e => openEdit(dog, e)}
                >
                  Rediger
                </button>
                <button
                  className="btn-danger"
                  style={{ fontSize: 13, padding: '8px 14px' }}
                  onClick={e => deleteDog(dog, e)}
                >
                  Slett
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2>{editDog ? 'Rediger hund' : 'Ny hund'}</h2>
            <div className="form-group">
              <label>Navn *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Hundens navn"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Rase</label>
              <input
                value={form.breed}
                onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                placeholder="F.eks. Maltipoo"
              />
            </div>
            <div className="form-group">
              <label>Fødselsdato</label>
              <input
                type="date"
                value={form.birth_date}
                onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Avbryt</button>
              <button className="btn-primary" onClick={save}>{editDog ? 'Lagre' : 'Opprett'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
