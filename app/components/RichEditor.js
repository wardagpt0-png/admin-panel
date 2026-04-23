'use client'
import { useRef, useState, useEffect } from 'react'

export default function RichEditor({ value, onChange, uploadImage }) {
  const editorRef = useRef(null)
  const [showHtml, setShowHtml] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (editorRef.current && !isReady) {
      editorRef.current.innerHTML = value || ''
      setIsReady(true)
    }
  }, [])

  const exec = (cmd, val = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    onChange(editorRef.current?.innerHTML || '')
  }

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || '')
  }

  const handleImageUpload = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      const alt = prompt('Texte alternatif (alt):') || file.name
      if (uploadImage) {
        const result = await uploadImage(file)
        if (result?.url) {
          editorRef.current?.focus()
          document.execCommand('insertHTML', false, 
            `<img src="${result.url}" alt="${alt}" style="max-width:100%;border-radius:8px;margin:8px 0;" />`)
          onChange(editorRef.current?.innerHTML || '')
        }
      }
    }
    input.click()
  }

  const setFontSize = (size) => exec('fontSize', size)
  const setColor = (color) => exec('foreColor', color)
  const setHeading = (tag) => exec('formatBlock', tag)

  const btnStyle = {
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.25)',
    color: '#a5b4fc', padding: '5px 9px', borderRadius: 6,
    cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo,sans-serif',
    transition: 'all 0.15s', whiteSpace: 'nowrap'
  }

  const colors = ['#ffffff','#f8fafc','#000000','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899']

  return (
    <div style={{ border: '1.5px solid rgba(99,102,241,0.25)', borderRadius: 12, overflow: 'hidden', background: 'rgba(15,23,42,0.8)' }}>
      
      {/* Toolbar Row 1 */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 10px', background: 'rgba(15,23,42,0.95)', flexWrap: 'wrap', borderBottom: '1px solid rgba(99,102,241,0.1)', alignItems: 'center' }}>
        
        {/* Headings */}
        <select onChange={e => setHeading(e.target.value)} defaultValue=""
          style={{ ...btnStyle, padding: '5px 8px', background: 'rgba(99,102,241,0.12)' }}>
          <option value="">Paragraphe</option>
          <option value="h1">Titre 1</option>
          <option value="h2">Titre 2</option>
          <option value="h3">Titre 3</option>
          <option value="h4">Titre 4</option>
          <option value="blockquote">Citation</option>
        </select>

        {/* Font Size */}
        <select onChange={e => setFontSize(e.target.value)} defaultValue="3"
          style={{ ...btnStyle, padding: '5px 8px', background: 'rgba(99,102,241,0.12)' }}>
          <option value="1">Petit</option>
          <option value="2">Normal</option>
          <option value="3">Moyen</option>
          <option value="4">Grand</option>
          <option value="5">Très grand</option>
          <option value="6">Énorme</option>
        </select>

        <div style={{ width: 1, height: 24, background: 'rgba(99,102,241,0.2)' }} />

        {/* Text Format */}
        <button type="button" onClick={() => exec('bold')} style={btnStyle}><b>B</b></button>
        <button type="button" onClick={() => exec('italic')} style={btnStyle}><i>I</i></button>
        <button type="button" onClick={() => exec('underline')} style={btnStyle}><u>U</u></button>
        <button type="button" onClick={() => exec('strikeThrough')} style={btnStyle}><s>S</s></button>

        <div style={{ width: 1, height: 24, background: 'rgba(99,102,241,0.2)' }} />

        {/* Alignment */}
        <button type="button" onClick={() => exec('justifyLeft')} style={btnStyle} title="Gauche">◀</button>
        <button type="button" onClick={() => exec('justifyCenter')} style={btnStyle} title="Centre">■</button>
        <button type="button" onClick={() => exec('justifyRight')} style={btnStyle} title="Droite">▶</button>
        <button type="button" onClick={() => exec('justifyFull')} style={btnStyle} title="Justifié">≡</button>

        <div style={{ width: 1, height: 24, background: 'rgba(99,102,241,0.2)' }} />

        {/* Lists */}
        <button type="button" onClick={() => exec('insertUnorderedList')} style={btnStyle}>• Liste</button>
        <button type="button" onClick={() => exec('insertOrderedList')} style={btnStyle}>1. Liste</button>

        <div style={{ width: 1, height: 24, background: 'rgba(99,102,241,0.2)' }} />

        {/* Image */}
        <button type="button" onClick={handleImageUpload} style={{ ...btnStyle, background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
          🖼 Image
        </button>

        {/* HTML Toggle */}
        <button type="button" onClick={() => {
          if (!showHtml && editorRef.current) {
            onChange(editorRef.current.innerHTML)
          }
          setShowHtml(!showHtml)
        }} style={{ ...btnStyle, background: showHtml ? 'rgba(99,102,241,0.35)' : btnStyle.background }}>
          &lt;/&gt; HTML
        </button>
      </div>

      {/* Toolbar Row 2 - Colors */}
      <div style={{ display: 'flex', gap: 6, padding: '6px 10px', background: 'rgba(15,23,42,0.9)', borderBottom: '1px solid rgba(99,102,241,0.1)', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>🎨</span>
        {colors.map(color => (
          <button key={color} type="button" onClick={() => setColor(color)}
            title={color}
            style={{ width: 20, height: 20, background: color, border: '2px solid rgba(255,255,255,0.2)', borderRadius: 4, cursor: 'pointer', padding: 0 }} />
        ))}
        <input type="color" onChange={e => setColor(e.target.value)}
          title="Couleur personnalisée"
          style={{ width: 28, height: 24, padding: 0, border: '1px solid rgba(99,102,241,0.3)', borderRadius: 4, cursor: 'pointer', background: 'transparent' }} />
        <span style={{ color: '#94a3b8', fontSize: 11, marginLeft: 8 }}>Couleur de fond:</span>
        <input type="color" onChange={e => exec('hiliteColor', e.target.value)}
          title="Couleur de fond"
          style={{ width: 28, height: 24, padding: 0, border: '1px solid rgba(99,102,241,0.3)', borderRadius: 4, cursor: 'pointer', background: 'transparent' }} />
        <button type="button" onClick={() => exec('removeFormat')}
          style={{ ...btnStyle, marginLeft: 'auto', color: '#fca5a5', borderColor: 'rgba(239,68,68,0.3)' }}>
          ✕ Effacer
        </button>
      </div>

      {/* Editor Area */}
      {showHtml ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', minHeight: 250, background: 'rgba(15,23,42,0.8)',
            color: '#a5b4fc', padding: 16, fontSize: 13,
            fontFamily: 'monospace', border: 'none', outline: 'none',
            resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6
          }}
          placeholder="<p>Écrivez votre HTML ici...</p>"
        />
      ) : (
        <>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            style={{
              minHeight: 250, background: 'rgba(15,23,42,0.6)',
              color: '#f8fafc', padding: 20, fontSize: 15,
              fontFamily: 'Cairo,sans-serif', outline: 'none',
              lineHeight: 1.8, direction: 'ltr'
            }}
          />
          {/* Preview label */}
          <div style={{ padding: '6px 16px', background: 'rgba(15,23,42,0.9)', borderTop: '1px solid rgba(99,102,241,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#475569', fontSize: 11 }}>Éditeur visuel actif</span>
            <button type="button" onClick={() => exec('undo')} style={{ ...btnStyle, fontSize: 11 }}>↩ Annuler</button>
          </div>
        </>
      )}
    </div>
  )
}
