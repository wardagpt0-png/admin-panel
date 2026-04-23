'use client'
import { useState } from 'react'

const DEFAULT_CATEGORIES = [
  'Serrure intelligente',
  'Pointeuse biométrique', 
  'Tourniquet tripode',
  'Coffre Fort',
  "Contrôle d'accès",
  'Caisse automatique',
  'Imprimante Thermique',
  "Contrôle d'accès porte",
  "Lecteurs contrôle d'accès"
]

export default function CategorySelector({ value, onChange, lang }) {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('custom_categories')
    const custom = saved ? JSON.parse(saved) : []
    return [...DEFAULT_CATEGORIES, ...custom]
  })
  const [newCat, setNewCat] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const addCategory = () => {
    if (!newCat.trim()) return
    const updated = [...categories, newCat.trim()]
    setCategories(updated)
    const custom = updated.filter(c => !DEFAULT_CATEGORIES.includes(c))
    localStorage.setItem('custom_categories', JSON.stringify(custom))
    onChange(newCat.trim())
    setNewCat('')
    setShowAdd(false)
  }

  const inp = {
    background: 'rgba(15,23,42,0.8)', border: '1.5px solid rgba(99,102,241,0.25)',
    color: '#f8fafc', borderRadius: 12, padding: '13px 18px', fontSize: 15,
    outline: 'none', width: '100%', fontFamily: 'Cairo,sans-serif',
    boxSizing: 'border-box'
  }

  return (
    <div>
      <select value={value} onChange={e => {
        if (e.target.value === '__new__') setShowAdd(true)
        else onChange(e.target.value)
      }} style={{ ...inp, cursor: 'pointer' }}>
        <option value="">{lang === 'ar' ? 'اختر فئة' : 'Choisir une catégorie'}</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
        <option value="__new__">+ {lang === 'ar' ? 'إضافة فئة جديدة' : 'Ajouter une catégorie'}</option>
      </select>

      {showAdd && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
            placeholder={lang === 'ar' ? 'اسم الفئة الجديدة' : 'Nom de la nouvelle catégorie'}
            style={{ ...inp, flex: 1 }}
            autoFocus
          />
          <button type="button" onClick={addCategory}
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', padding: '0 20px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'Cairo,sans-serif', fontWeight: 700 }}>
            {lang === 'ar' ? 'إضافة' : 'Ajouter'}
          </button>
          <button type="button" onClick={() => setShowAdd(false)}
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '0 14px', borderRadius: 12, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
