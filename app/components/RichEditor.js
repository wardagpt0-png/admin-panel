'use client'
import { useRef, useEffect, useState } from 'react'

export default function RichEditor({ value, onChange, onUploadImage }) {
  const editorRef = useRef(null)
  const [mode, setMode] = useState('visual') // visual | html | preview
  const [htmlValue, setHtmlValue] = useState(value || '')

  useEffect(() => {
    if (editorRef.current && mode === 'visual') {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [mode])

  useEffect(() => {
    setHtmlValue(value || '')
  }, [value])

  const exec = (cmd, val = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    const html = editorRef.current?.innerHTML || ''
    onChange(html)
    setHtmlValue(html)
  }

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || ''
    onChange(html)
    setHtmlValue(html)
  }

  const handleHtmlChange = (e) => {
    setHtmlValue(e.target.value)
    onChange(e.target.value)
  }

  const switchToVisual = () => {
    setMode('visual')
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlValue
      }
    }, 50)
  }

  const handleImageUpload = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file || !onUploadImage) return
      const alt = prompt('Texte alternatif (alt):') || file.name
      const result = await onUploadImage(file)
      if (result?.url) {
        editorRef.current?.focus()
        document.execCommand('insertHTML', false,
          `<img src="${result.url}" alt="${alt}" style="max-width:100%;border-radius:8px;margin:8px 0;" />`)
        const html = editorRef.current?.innerHTML || ''
        onChange(html)
        setHtmlValue(html)
      }
    }
    input.click()
  }

  const insertLink = () => {
    const url = prompt('URL du lien:')
    const text = prompt('Texte du lien:') || url
    if (url) exec('insertHTML', `<a href="${url}" target="_blank" style="color:#818cf8;text-decoration:underline;">${text}</a>`)
  }

  const insertTable = () => {
    exec('insertHTML', `
      <table style="width:100%;border-collapse:collapse;margin:12px 0;">
        <tr>
          <th style="border:1px solid #334155;padding:8px;background:#1e293b;color:#f8fafc;">Colonne 1</th>
          <th style="border:1px solid #334155;padding:8px;background:#1e293b;color:#f8fafc;">Colonne 2</th>
        </tr>
        <tr>
          <td style="border:1px solid #334155;padding:8px;color:#f8fafc;">Valeur 1</td>
          <td style="border:1px solid #334155;padding:8px;color:#f8fafc;">Valeur 2</td>
        </tr>
      </table>`)
  }

  const btn = (active = false) => ({
    background: active ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.1)',
    border: `1px solid rgba(99,102,241,${active ? '0.6' : '0.2'})`,
    color: active ? '#c7d2fe' : '#a5b4fc',
    padding: '5px 9px', borderRadius: 6, cursor: 'pointer',
    fontSize: 12, fontFamily: 'Cairo,sans-serif', whiteSpace: 'nowrap'
  })

  const COLORS = [
    '#ffffff','#000000','#ef4444','#f97316',
    '#eab308','#22c55e','#3b82f6','#8b5cf6',
    '#ec4899','#14b8a6','#f1f5f9','#94a3b8'
  ]

  const sep = <div style={{ width: 1, height: 22, background: 'rgba(99,102,241,0.2)', margin: '0 2px' }} />

  return (
    <div style={{ border: '1.5px solid rgba(99,102,241,0.3)', borderRadius: 14, overflow: 'hidden' }}>

      {/* Mode Tabs */}
      <div style={{ display: 'flex', background: 'rgba(15,23,42,0.98)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
        {['visual','html','preview'].map(m => (
          <button key={m} type="button"
            onClick={() => m === 'visual' ? switchToVisual() : setMode(m)}
            style={{ ...btn(mode === m), borderRadius: 0, padding: '8px 16px', fontSize: 13, fontWeight: mode === m ? 700 : 400, borderTop: 'none', borderLeft: 'none', borderRight: '1px solid rgba(99,102,241,0.1)', borderBottom: mode === m ? '2px solid #6366f1' : '2px solid transparent' }}>
            {m === 'visual' ? '✏️ Visuel' : m === 'html' ? '</> HTML' : '👁 Aperçu'}
          </button>
        ))}
      </div>

      {/* Toolbar - only in visual mode */}
      {mode === 'visual' && (
        <>
          <div style={{ display: 'flex', gap: 3, padding: '7px 10px', background: 'rgba(15,23,42,0.95)', flexWrap: 'wrap', borderBottom: '1px solid rgba(99,102,241,0.1)', alignItems: 'center' }}>
            <select onChange={e => exec('formatBlock', e.target.value)}
              style={{ ...btn(), padding: '4px 6px', fontSize: 12 }}>
              <option value="p">Paragraphe</option>
              <option value="h1">Titre H1</option>
              <option value="h2">Titre H2</option>
              <option value="h3">Titre H3</option>
              <option value="h4">Titre H4</option>
              <option value="blockquote">Citation</option>
              <option value="pre">Code</option>
            </select>
            <select onChange={e => exec('fontSize', e.target.value)}
              style={{ ...btn(), padding: '4px 6px', fontSize: 12 }}>
              <option value="2">Petit</option>
              <option value="3">Normal</option>
              <option value="4">Grand</option>
              <option value="5">Très grand</option>
              <option value="6">Énorme</option>
            </select>
            {sep}
            <button type="button" onClick={() => exec('bold')} style={btn()}><strong>B</strong></button>
            <button type="button" onClick={() => exec('italic')} style={btn()}><em>I</em></button>
            <button type="button" onClick={() => exec('underline')} style={btn()}><u>U</u></button>
            <button type="button" onClick={() => exec('strikeThrough')} style={btn()}><s>S</s></button>
            {sep}
            <button type="button" onClick={() => exec('justifyLeft')} style={btn()}>⬅️</button>
            <button type="button" onClick={() => exec('justifyCenter')} style={btn()}>↔️</button>
            <button type="button" onClick={() => exec('justifyRight')} style={btn()}>➡️</button>
            {sep}
            <button type="button" onClick={() => exec('insertUnorderedList')} style={btn()}>• Liste</button>
            <button type="button" onClick={() => exec('insertOrderedList')} style={btn()}>1. Liste</button>
            {sep}
            <button type="button" onClick={insertLink} style={btn()}>🔗 Lien</button>
            <button type="button" onClick={handleImageUpload} style={{ ...btn(), color: '#6ee7b7', borderColor: 'rgba(16,185,129,0.3)' }}>🖼 Image</button>
            <button type="button" onClick={insertTable} style={btn()}>⊞ Tableau</button>
            {sep}
            <button type="button" onClick={() => exec('undo')} style={btn()}>↩</button>
            <button type="button" onClick={() => exec('redo')} style={btn()}>↪</button>
            <button type="button" onClick={() => exec('removeFormat')} style={{ ...btn(), color: '#fca5a5', borderColor: 'rgba(239,68,68,0.2)' }}>✕ Style</button>
          </div>

          {/* Colors Row */}
          <div style={{ display: 'flex', gap: 5, padding: '6px 10px', background: 'rgba(15,23,42,0.9)', borderBottom: '1px solid rgba(99,102,241,0.08)', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: '#64748b', fontSize: 11, marginRight: 4 }}>Texte:</span>
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => exec('foreColor', c)}
                style={{ width: 18, height: 18, background: c, border: '2px solid rgba(255,255,255,0.15)', borderRadius: 3, cursor: 'pointer', padding: 0, flexShrink: 0 }} />
            ))}
            <input type="color" title="Couleur personnalisée"
              onChange={e => exec('foreColor', e.target.value)}
              style={{ width: 24, height: 20, padding: 0, border: '1px solid rgba(99,102,241,0.3)', borderRadius: 3, cursor: 'pointer', background: 'transparent' }} />
            <span style={{ color: '#64748b', fontSize: 11, marginRight: 4, marginLeft: 8 }}>Fond:</span>
            {COLORS.map(c => (
              <button key={`bg-${c}`} type="button" onClick={() => exec('hiliteColor', c)}
                style={{ width: 18, height: 18, background: c, border: '2px solid rgba(255,255,255,0.15)', borderRadius: 3, cursor: 'pointer', padding: 0, flexShrink: 0 }} />
            ))}
            <input type="color" title="Couleur de fond"
              onChange={e => exec('hiliteColor', e.target.value)}
              style={{ width: 24, height: 20, padding: 0, border: '1px solid rgba(99,102,241,0.3)', borderRadius: 3, cursor: 'pointer', background: 'transparent' }} />
          </div>
        </>
      )}

      {/* Editor Areas */}
      {mode === 'visual' && (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          style={{
            minHeight: 280, background: 'rgba(15,23,42,0.5)',
            color: '#f8fafc', padding: '18px 20px', fontSize: 15,
            fontFamily: 'Cairo,sans-serif', outline: 'none', lineHeight: 1.8,
          }}
        />
      )}

      {mode === 'html' && (
        <textarea
          value={htmlValue}
          onChange={handleHtmlChange}
          style={{
            width: '100%', minHeight: 280, background: 'rgba(15,23,42,0.5)',
            color: '#a5b4fc', padding: '18px 20px', fontSize: 13,
            fontFamily: 'monospace', border: 'none', outline: 'none',
            resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7
          }}
          placeholder="<p>Écrivez votre HTML ici...</p>"
        />
      )}

      {mode === 'preview' && (
        <div
          dangerouslySetInnerHTML={{ __html: htmlValue }}
          style={{
            minHeight: 280, background: 'white',
            color: '#1e293b', padding: '18px 20px', fontSize: 15,
            fontFamily: 'system-ui,sans-serif', lineHeight: 1.8
          }}
        />
      )}

      <div style={{ padding: '5px 12px', background: 'rgba(15,23,42,0.98)', borderTop: '1px solid rgba(99,102,241,0.08)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#475569', fontSize: 10 }}>
          {htmlValue.length} caractères
        </span>
        <span style={{ color: '#475569', fontSize: 10 }}>Rich Text Editor</span>
      </div>
    </div>
  )
}
