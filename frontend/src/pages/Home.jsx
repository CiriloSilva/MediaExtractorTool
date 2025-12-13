import { useState } from 'react'

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState(null)
  const [type, setType] = useState('mp4')
  const [quality, setQuality] = useState('')

  // =========================
  // EXTRAI OPÇÕES DISPONÍVEIS
  // =========================
  async function handleExtract() {
    if (!url) return alert('Cole uma URL')

    setLoading(true)
    setOptions(null)

    try {
      const res = await fetch('http://localhost:3333/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      if (!res.ok) throw new Error('Erro ao extrair')

      const data = await res.json()
      setOptions(data)

      if (data.video?.length) {
        setQuality(data.video[0].quality)
      }
    } catch (err) {
      alert('Falha ao extrair opções')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // DOWNLOAD DA MÍDIA
  // =========================
  function handleDownload() {
    let downloadUrl =
      `http://localhost:3333/api/download?url=${encodeURIComponent(url)}&type=${type}`

    if (type === 'mp4' && quality) {
      downloadUrl += `&quality=${quality}`
    }

    window.location.href = downloadUrl
  }

  // =========================
  // ANIMAÇÃO DE GIRO
  // =========================
  const styleSheet = document.styleSheets[0]
  styleSheet.insertRule(`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `, styleSheet.cssRules.length)

  // =========================
  // RENDER
  // =========================
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Media Extractor Tool</h1>
        <p style={styles.subtitle}>
          Baixe vídeos em MP4 ou apenas o áudio em MP3
        </p>

        <input
          style={styles.input}
          placeholder="YouTube, Instagram, Twitter, Facebook…"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />

        <button style={styles.primaryButton} onClick={handleExtract}>
          Extrair opções
        </button>

        {loading && (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <span>Processando mídia…</span>
          </div>
        )}

        {options && !loading && (
          <>
            {/* =========================
                MP4 / MP3 (AJUSTE SUTIL)
            ========================= */}
            <div style={styles.formatGroup}>
              <label
                style={{
                  ...styles.formatOption,
                  ...(type === 'mp4' ? styles.formatActive : {})
                }}
              >
                <input
                  type="radio"
                  checked={type === 'mp4'}
                  onChange={() => setType('mp4')}
                  hidden
                />

                {/* SVG MP4 */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h16v16H4zM8 8v8l6-4z" />
                </svg>

                <span>
                  <strong>MP4 </strong>
                  <small>vídeo + áudio</small>
                </span>
              </label>

              <label
                style={{
                  ...styles.formatOption,
                  ...(type === 'mp3' ? styles.formatActive : {})
                }}
              >
                <input
                  type="radio"
                  checked={type === 'mp3'}
                  onChange={() => setType('mp3')}
                  hidden
                />

                {/* SVG MP3 */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z" />
                </svg>

                <span>
                  <strong>MP3 </strong>
                  <small>áudio</small>
                </span>
              </label>
            </div>

            {type === 'mp4' && (
              <select
                style={styles.select}
                value={quality}
                onChange={e => setQuality(e.target.value)}
              >
                {options.video.map(v => (
                  <option key={v.quality} value={v.quality}>
                    {v.label}
                  </option>
                ))}
              </select>
            )}

            <button style={styles.downloadButton} onClick={handleDownload}>
              Baixar
            </button>
          </>
        )}
      </div>

      <footer style={styles.footer}>
        <p>
          Projeto educacional para extração de mídia de plataformas públicas,
          respeitando os termos de uso.
        </p>

        <a
          href="https://github.com/CiriloSilva"
          target="_blank"
          rel="noreferrer"
          style={styles.github}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.26.793-.577v-2.17c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.552 3.297-1.23 3.297-1.23.655 1.653.243 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.62-5.48 5.92.43.37.823 1.102.823 2.222v3.293c0 .32.19.694.8.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </a>
      </footer>
    </div>
  )
}

// =========================
// ESTILOS
// =========================
const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, #020617, #000)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    color: '#e5e7eb',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#020617',
    borderRadius: 16,
    padding: 28,
    boxShadow: '0 25px 50px rgba(0,0,0,.7)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  title: {
    textAlign: 'center',
    fontSize: 26
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#94a3b8'
  },
  input: {
    padding: 12,
    borderRadius: 10,
    border: '1px solid #1e293b',
    background: '#020617',
    color: '#fff'
  },
  primaryButton: {
    padding: 12,
    borderRadius: 10,
    background: '#334155',
    border: 'none',
    color: '#fff',
    cursor: 'pointer'
  },

  // ⭐ AJUSTE VISUAL AQUI
  formatGroup: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center'
  },
  formatOption: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #1e293b',
    cursor: 'pointer',
    transition: 'all .15s ease',
    fontSize: 13,
    color: '#cbd5f5'
  },
  formatActive: {
    borderColor: '#6366f1',
    background: 'rgba(99,102,241,.08)',
    boxShadow: '0 0 0 1px rgba(99,102,241,.4)'
  },

  select: {
    padding: 12,
    borderRadius: 10,
    border: '1px solid #1e293b',
    background: '#020617',
    color: '#fff'
  },
  downloadButton: {
    padding: 12,
    borderRadius: 10,
    background: '#4f46e5',
    border: 'none',
    color: '#fff',
    cursor: 'pointer'
  },
  loading: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    color: '#94a3b8'
  },
  spinner: {
    width: 18,
    height: 18,
    border: '2px solid #334155',
    borderTop: '2px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  footer: { 
    marginTop: 24,
    maxWidth: 420,
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b'
  },
  github: {
    marginTop: 8,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: '#94a3b8',
    textDecoration: 'none'
  }
}
