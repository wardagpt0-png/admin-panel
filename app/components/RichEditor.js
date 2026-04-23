'use client'
import { useState } from 'react'

export default function RichEditor({ value, onChange }) {
  const [showHtml, setShowHtml] = useState(false)

  const execCmd = (cmd, val = null) => {
    document.execCommand(cmd, false, val)
  }

  const insertImage = () => {
    const url = prompt('رابط الصورة:')
    if (url) execCmd('insertImage', url)
  }

  const insertColor = () => {
    const color = prompt('اللون (مثال: #ff0000 أو red):')
    if (color) execCmd('foreColor', color)
  }

  const btn = {
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    color: '#a5b4fc',
    padding: '6px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'Cairo,sans-serif',
  }

  return (
    <div style={{ border: '1.5px solid rgba(99,102,241,0.25)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 4, padding: '8px 12px', background: 'rgba(15,23,42,0.9)', flexWrap: 'wrap', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
        <button type="button" onClick={() => execCmd('bold')} style={btn}><b>B</b></button>
        <button type="button" onClick={() => execCmd('italic')} style={btn}><i>I</i></button>
        <button type="button" onClick={() => execCmd('underline')} style={btn}><u>U</u></button>
        <button type="button" onClick={() => execCmd('strikeThrough')} style={btn}><s>S</s></button>
        <div style={{ width: 1, background: 'rgba(99,102,241,0.2)', margin: '0 4px' }} />
        <button type="button" onClick={() => execCmd('justifyLeft')} style={btn}>⬅</button>
        <button type="button" onClick={() => execCmd('justifyCenter')} style={btn}>≡</button>
        <button type="button" onClick={() => execCmd('justifyRight')} style={btn}>➡</button>
        <div style={{ width: 1, background: 'rgba(99,102,241,0.2)', margin: '0 4px' }} />
        <button type="button" onClick={() => execCmd('insertUnorderedList')} style={btn}>• List</button>
        <button type="button" onClick={() => execCmd('insertOrderedList')} style={btn}>1. List</button>
        <div style={{ width: 1, background: 'rgba(99,102,241,0.2)', margin: '0 4px' }} />
        <button type="button" onClick={insertColor} style={btn}>🎨 لون</button>
        <button type="button" onClick={insertImage} style={btn}>🖼 صورة</button>
        <div style={{ width: 1, background: 'rgba(99,102,241,0.2)', margin: '0 4px' }} />
        <button type="button" onClick={() => setShowHtml(!showHtml)}
          style={{ ...btn, background: showHtml ? 'rgba(99,102,241,0.4)' : btn.background }}>
          &lt;/&gt; HTML
        </button>
      </div>

      {/* Editor */}
      {showHtml ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', minHeight: 200, background: 'rgba(15,23,42,0.8)',
            color: '#f8fafc', padding: '16px', fontSize: 13,
            fontFamily: 'monospace', border: 'none', outline: 'none',
            resize: 'vertical', boxSizing: 'border-box'
          }}
          placeholder="<p>اكتب HTML هنا...</p>"
        />
      ) : (
        <div
          contentEditable
          suppressContentEditableWarning
          onInput={e => onChange(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: value }}
          style={{
            minHeight: 200, background: 'rgba(15,23,42,0.8)',
            color: '#f8fafc', padding: '16px', fontSize: 15,
            fontFamily: 'Cairo,sans-serif', outline: 'none',
            lineHeight: 1.8
          }}
        />
      )}
    </div>
  )
}
