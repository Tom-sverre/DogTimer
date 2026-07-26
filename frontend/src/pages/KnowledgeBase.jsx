import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { marked } from 'marked'

// ── YouTube helpers ────────────────────────────────────────────────────────────
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function isYouTubeUrl(url) {
  return /youtube\.com|youtu\.be/.test(url)
}

function YouTubeEmbed({ videoId }) {
  return (
    <div className="youtube-embed">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

// ── Renders markdown with YouTube support ──────────────────────────────────────
function MarkdownContent({ content }) {
  // Null-guard: ikke krasj hvis content er tom/undefined
  if (!content) return null

  // Pre-process: replace [youtube:ID] shortcodes with placeholder
  const PLACEHOLDER = '___YT___'
  const ytShortcodes = []
  const processed = content.replace(/\[youtube:([A-Za-z0-9_-]{11})\]/g, (_, id) => {
    ytShortcodes.push(id)
    return `${PLACEHOLDER}${ytShortcodes.length - 1}${PLACEHOLDER}`
  })

  // Convert markdown to HTML – bruk marked.parse() (korrekt API for marked v5+/v12)
  const html = marked.parse(processed, { breaks: true })

  // Split HTML on YouTube placeholders and render with embeds
  const parts = html.split(new RegExp(`${PLACEHOLDER}(\\d+)${PLACEHOLDER}`))

  return (
    <div className="markdown-body">
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          // Odd indexes are the captured group (index into ytShortcodes)
          const id = ytShortcodes[parseInt(part, 10)]
          return id ? <YouTubeEmbed key={i} videoId={id} /> : null
        }
        // Replace YouTube links in rendered HTML with embeds
        return <HtmlWithYouTube key={i} html={part} />
      })}
    </div>
  )
}

function HtmlWithYouTube({ html }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    // Find all <a> tags that are YouTube links and replace with iframes
    const links = ref.current.querySelectorAll('a')
    links.forEach(a => {
      if (isYouTubeUrl(a.href)) {
        const id = extractYouTubeId(a.href)
        if (id) {
          const wrapper = document.createElement('div')
          wrapper.className = 'youtube-embed'
          wrapper.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
          a.parentNode.replaceChild(wrapper, a)
        }
      } else {
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
      }
    })
  }, [html])

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
}

// ── Sidebar (standalone komponent – unngår "component-inside-render" anti-pattern) ──
function Sidebar({ searchQ, setSearchQ, setSelectedCat, selectedCat, categories, articles, selectCat }) {
  return (
    <>
      <h3>Søk</h3>
      <input
        value={searchQ}
        onChange={e => { setSearchQ(e.target.value); setSelectedCat(null) }}
        placeholder="Søk i artikler..."
        style={{ marginBottom: 14 }}
      />
      <h3>Kategorier</h3>
      <button className={`kb-cat-btn ${!selectedCat ? 'active' : ''}`} onClick={() => selectCat(null)}>
        📂 Alle
        <span style={{ float: 'right', color: 'var(--text2)', fontSize: 12 }}>{articles.length}</span>
      </button>
      {categories.map(cat => (
        <button key={cat} className={`kb-cat-btn ${selectedCat === cat ? 'active' : ''}`} onClick={() => selectCat(cat)}>
          📁 {cat}
        </button>
      ))}
      {categories.length === 0 && <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 6 }}>Ingen kategorier ennå</p>}
    </>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function KnowledgeBase() {
  const { dogId } = useParams()
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCat, setSelectedCat] = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editArticle, setEditArticle] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    title: '', category: '', newCategory: '', tags: '', content: '', youtube_urls: [], newYtUrl: ''
  })

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000) }

  const fetchAll = useCallback(async () => {
    const params = new URLSearchParams()
    if (selectedCat) params.set('category', selectedCat)
    if (searchQ)     params.set('q', searchQ)
    const [ra, rc] = await Promise.all([
      fetch(`/api/knowledge/${dogId}?${params}`),
      fetch(`/api/knowledge/${dogId}/meta/categories`)
    ])
    if (ra.ok) setArticles(await ra.json())
    if (rc.ok) setCategories(await rc.json())
  }, [dogId, selectedCat, searchQ])

  useEffect(() => { fetchAll() }, [fetchAll])

  function openNew() {
    setEditArticle(null)
    setForm({ title: '', category: selectedCat || '', newCategory: '', tags: '', content: '', youtube_urls: [], newYtUrl: '' })
    setShowModal(true)
  }

  function openEdit(article, e) {
    e?.stopPropagation()
    setEditArticle(article)
    setForm({
      title: article.title,
      category: article.category,
      newCategory: '',
      tags: article.tags,
      content: article.content || '',
      youtube_urls: article.youtube_urls || [],
      newYtUrl: ''
    })
    setShowModal(true)
  }

  function addYtUrl() {
    const url = form.newYtUrl.trim()
    if (!url) return
    if (!isYouTubeUrl(url)) { flash('Ikke en gyldig YouTube-URL'); return }
    setForm(f => ({ ...f, youtube_urls: [...f.youtube_urls, url], newYtUrl: '' }))
  }

  function removeYtUrl(idx) {
    setForm(f => ({ ...f, youtube_urls: f.youtube_urls.filter((_, i) => i !== idx) }))
  }

  async function save() {
    if (!form.title.trim()) { flash('Tittel er påkrevd'); return }
    const cat = (form.category || form.newCategory).trim() || 'Generelt'
    const body = {
      title: form.title.trim(),
      category: cat,
      tags: form.tags.trim(),
      content: form.content,
      youtube_urls: form.youtube_urls
    }
    const url    = editArticle ? `/api/knowledge/${dogId}/${editArticle.id}` : `/api/knowledge/${dogId}`
    const method = editArticle ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (r.ok) {
      setShowModal(false)
      const saved = await r.json()
      fetchAll()
      if (editArticle) setSelectedArticle(saved)
    } else {
      flash('Feil ved lagring')
    }
  }

  async function del(id, e) {
    e?.stopPropagation()
    if (!confirm('Slett artikkel?')) return
    await fetch(`/api/knowledge/${dogId}/${id}`, { method: 'DELETE' })
    if (selectedArticle?.id === id) setSelectedArticle(null)
    fetchAll()
  }

  function selectCat(cat) {
    setSelectedCat(cat)
    setSearchQ('')
    setSidebarOpen(false)
  }

  async function importKb(e) {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const r = await fetch(`/api/knowledge/${dogId}/meta/import`, { method: 'POST', body: fd })
    if (r.ok) { flash('Importert!'); fetchAll() } else flash('Import feilet')
    e.target.value = ''
  }

  const sidebarProps = { searchQ, setSearchQ, setSelectedCat, selectedCat, categories, articles, selectCat }

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
          <h1>📚 Kunnskapsbase</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn-secondary" onClick={() => window.open(`/api/knowledge/${dogId}/meta/export`)}>
            ⬇️ Eksport
          </button>
          <label style={{
            background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
            padding: '10px 14px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, minHeight: 40
          }}>
            ⬆️ Importer
            <input type="file" accept=".zip" style={{ display: 'none' }} onChange={importKb} />
          </label>
          <button className="btn-primary" onClick={openNew}>+ Ny artikkel</button>
        </div>
      </div>

      {msg && (
        <div style={{ background: 'var(--success)', color: '#000', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontWeight: 500 }}>
          {msg}
        </div>
      )}

      {/* Mobile sidebar toggle */}
      <button className="kb-sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
        <span>📁 {selectedCat || 'Alle kategorier'}</span>
        <span>{sidebarOpen ? '▲' : '▼'}</span>
      </button>
      {sidebarOpen && (
        <div className="kb-sidebar" style={{ marginBottom: 12 }}>
          <Sidebar {...sidebarProps} />
        </div>
      )}

      <div className="kb-layout">
        {/* Desktop sidebar */}
        <aside className="kb-sidebar" style={{ display: 'block' }}>
          <Sidebar {...sidebarProps} />
        </aside>

        {/* Main content */}
        <main>
          {selectedArticle ? (
            // ── Article reader ─────────────────────────────────────────────
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <button className="btn-secondary" onClick={() => setSelectedArticle(null)}>← Tilbake</button>
                <span className="tag accent">{selectedArticle.category}</span>
                {selectedArticle.tags && selectedArticle.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
                <div style={{ flex: 1 }} />
                <button className="btn-secondary" onClick={e => openEdit(selectedArticle, e)}>✏️ Rediger</button>
                <button className="btn-danger" onClick={e => del(selectedArticle.id, e)}>Slett</button>
              </div>

              <div className="card">
                <h1 style={{ fontSize: 22, marginBottom: 6 }}>{selectedArticle.title}</h1>
                <p style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 18 }}>
                  Sist oppdatert: {new Date(selectedArticle.updated_at).toLocaleDateString('nb-NO')}
                </p>

                {/* Explicit YouTube section */}
                {selectedArticle.youtube_urls?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>📺 Videoer</p>
                    {selectedArticle.youtube_urls.map((url, i) => {
                      const id = extractYouTubeId(url)
                      return id ? <YouTubeEmbed key={i} videoId={id} /> : null
                    })}
                  </div>
                )}

                <MarkdownContent content={selectedArticle.content} />
              </div>
            </div>
          ) : (
            // ── Article list ──────────────────────────────────────────────
            <>
              {(searchQ || selectedCat) && (
                <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 10 }}>
                  {articles.length} resultat{articles.length !== 1 ? 'er' : ''}
                  {searchQ && ` for «${searchQ}»`}
                  {selectedCat && ` i ${selectedCat}`}
                </p>
              )}
              {articles.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">📚</div>
                  <p>{searchQ || selectedCat ? 'Ingen artikler funnet' : 'Ingen artikler ennå.\nLegg til din første!'}</p>
                  {!searchQ && !selectedCat && (
                    <button className="btn-primary" style={{ marginTop: 16 }} onClick={openNew}>+ Legg til artikkel</button>
                  )}
                </div>
              ) : (
                articles.map(a => (
                  <div key={a.id} className="kb-article-card" onClick={() => setSelectedArticle(a)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <h3 style={{ flex: 1 }}>{a.title}</h3>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '5px 10px', fontSize: 12, minHeight: 32 }}
                          onClick={e => openEdit(a, e)}
                        >✏️</button>
                        <button
                          className="btn-danger"
                          style={{ padding: '5px 10px', fontSize: 12, minHeight: 32 }}
                          onClick={e => del(a.id, e)}
                        >🗑️</button>
                      </div>
                    </div>
                    <div className="meta">
                      <span className="tag accent" style={{ fontSize: 11 }}>{a.category}</span>
                      {a.tags && a.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3).map(t => (
                        <span key={t} className="tag" style={{ fontSize: 11 }}>{t}</span>
                      ))}
                      {a.youtube_urls?.length > 0 && (
                        <span style={{ color: 'var(--danger)', fontSize: 12 }}>▶ {a.youtube_urls.length} video{a.youtube_urls.length > 1 ? 'er' : ''}</span>
                      )}
                      <span style={{ marginLeft: 'auto', color: 'var(--text2)', fontSize: 12 }}>
                        {new Date(a.updated_at).toLocaleDateString('nb-NO')}
                      </span>
                    </div>
                    {a.content && (
                      <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {a.content.replace(/[#*`>\-\[\]]/g, '').slice(0, 180)}
                      </p>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '100%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2>{editArticle ? 'Rediger artikkel' : 'Ny artikkel'}</h2>

            <div className="form-group">
              <label>Tittel *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Artikkelnavn" autoFocus />
            </div>

            <div className="form-group">
              <label>Kategori</label>
              {categories.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, newCategory: '' }))}>
                    <option value="">– Ny kategori –</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {!form.category && (
                    <input
                      value={form.newCategory}
                      onChange={e => setForm(f => ({ ...f, newCategory: e.target.value }))}
                      placeholder="Skriv ny kategori..."
                    />
                  )}
                </div>
              ) : (
                <input
                  value={form.newCategory}
                  onChange={e => setForm(f => ({ ...f, newCategory: e.target.value }))}
                  placeholder="F.eks. Rase, Helse, Trening"
                />
              )}
            </div>

            <div className="form-group">
              <label>Stikkord</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="maltipoo, pels, ernæring" />
            </div>

            <div className="form-group">
              <label>📺 YouTube-videoer</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  value={form.newYtUrl}
                  onChange={e => setForm(f => ({ ...f, newYtUrl: e.target.value }))}
                  placeholder="Lim inn YouTube-lenke..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addYtUrl())}
                />
                <button type="button" className="btn-secondary" onClick={addYtUrl} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                  + Legg til
                </button>
              </div>
              {form.youtube_urls.map((url, i) => (
                <div key={i} className="youtube-url-tag">
                  <span>▶ {url}</span>
                  <button onClick={() => removeYtUrl(i)}>Fjern</button>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Innhold (Markdown)</label>
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder={'# Overskrift\n\nSkriv med Markdown. YouTube-lenker i teksten spilles av direkte.\n\n**Fet**, *kursiv*, [lenke](https://...)'}
                style={{ minHeight: 200, fontFamily: 'monospace', fontSize: 13 }}
              />
            </div>

            <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>
              💡 Lim inn YouTube-lenker i teksten – de spilles av automatisk. Bruk <code style={{ background: 'none', color: 'var(--accent)' }}>[youtube:VIDEO_ID]</code> for presis plassering.
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Avbryt</button>
              <button className="btn-primary" onClick={save}>Lagre artikkel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
