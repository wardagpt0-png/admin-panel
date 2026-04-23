'use client'

const CATEGORIES = [
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
  const inp = {
    background: 'rgba(15,23,42,0.8)', border: '1.5px solid rgba(99,102,241,0.25)',
    color: '#f8fafc', borderRadius: 12, padding: '13px 18px', fontSize: 15,
    outline: 'none', width: '100%', fontFamily: 'Cairo,sans-serif', boxSizing: 'border-box',
    cursor: 'pointer'
  }

  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={inp}>
      <option value="">{lang === 'ar' ? '-- اختر فئة --' : '-- Choisir une catégorie --'}</option>
      {CATEGORIES.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  )
}
