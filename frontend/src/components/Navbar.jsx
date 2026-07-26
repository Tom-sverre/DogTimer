import { Link, useLocation, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const loc = useLocation()
  const [dogName, setDogName] = useState(null)

  // Hent hundenavn om vi er på en hundeside
  const match = loc.pathname.match(/^\/dog\/(\d+)/)
  const dogId = match ? match[1] : null

  useEffect(() => {
    if (dogId) {
      fetch(`/api/dogs/${dogId}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setDogName(d.name))
        .catch(() => {})
    } else {
      setDogName(null)
    }
  }, [dogId])

  const subPage = loc.pathname.split('/')[3]
  const subLabels = {
    'søvn': '😴 Søvn',
    'mat': '🍖 Mat',
    'vet': '🏥 Vet',
    'kunnskap': '📚 Kunnskap',
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo">🐾 DogTime</Link>

      {/* Alltid synlig */}
      <Link to="/" className={loc.pathname === '/' ? 'active' : ''}>Hunder</Link>

      {/* Vises kun når man er inne på en hund */}
      {dogId && dogName && (
        <>
          <span style={{ color: 'var(--border)', fontSize: 16, flexShrink: 0 }}>›</span>
          <Link to={`/dog/${dogId}`} className={loc.pathname === `/dog/${dogId}` ? 'active' : ''}>
            🐶 {dogName}
          </Link>
          {subPage && subLabels[subPage] && (
            <>
              <span style={{ color: 'var(--border)', fontSize: 16, flexShrink: 0 }}>›</span>
              <span style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500, flexShrink: 0 }}>
                {subLabels[subPage]}
              </span>
            </>
          )}
        </>
      )}

      <div className="spacer" />

      <Link to="/innstillinger" className={loc.pathname === '/innstillinger' ? 'active' : ''}>
        ⚙️
      </Link>
    </nav>
  )
}
