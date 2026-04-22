'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProductsPage() {
  const [project, setProject] = useState(null)
  const [lang, setLang] = useState('ar')
  const [mode, setMode] = useState('add') // add | edit | list
  const [products, setProducts] = useState([])
  const [editSlug, setEditSlug] = useState(null)
  const [form, setForm] = useState({
    title: '', price: '', oldPrice: '', discountPercentage: '',
    description: '', detailedDescription: '', metaDescription: '',
    features: '', benefits: '', labels: '', category: '',
    slug: '', rating: '4.8', reviewCount: '50', images: []
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const p = localStorage.getItem('project')
    const l = localStorage.getItem('lang') || 'ar'
    if (!p) { router.push('/'); return }
    setProject(JSON.parse(p))
    setLang(l)
  }, [])

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const t = {
    ar: {
      title: 'إضافة منتج جديد', back: 'رجوع', list: 'قائمة المنتجات',
      f_title: 'اسم المنتج', f_price: 'السعر الحالي (درهم)', f_oldPrice: 'السعر قبل التخفيض',
      f_discount: 'نسبة التخفيض (مثال: 34%)', f_desc: 'الوصف المختصر',
      f_detailed: 'الوصف التفصيلي', f_meta: 'Meta Description (SEO)',
      f_features: 'المميزات (مفصولة بفاصلة)', f_benefits: 'الفوائد (مفصولة بفاصلة)',
      f_labels: 'التصنيفات', f_category: 'الفئة', f_slug: 'رابط المنتج (slug)',
      f_rating: 'التقييم (مثال: 4.8)', f_reviews: 'عدد التقييمات',
      f_images: 'صور المنتج', publish: '🚀 نشر المنتج', publishing: 'جاري النشر...',
      success: '✅ تم النشر بنجاح!', required: 'يرجى ملء الحقول المطلوبة',
      alt: 'النص البديل للصورة', edit: 'تعديل', delete: 'حذف',
      confirm_delete: 'هل أنت متأكد من الحذف؟', update: '✏️ حفظ التعديلات',
      add_new: '+ إضافة منتج جديد'
    },
    fr: {
      title: 'Ajouter un produit', back: 'Retour', list: 'Liste des produits',
      f_title: 'Nom du produit', f_price: 'Prix actuel (MAD)', f_oldPrice: 'Prix avant réduction',
      f_discount: 'Pourcentage de réduction (ex: 34%)', f_desc: 'Description courte',
      f_detailed: 'Description détaillée', f_meta: 'Meta Description (SEO)',
      f_features: 'Caractéristiques (séparées par virgule)', f_benefits: 'Avantages (séparés par virgule)',
      f_labels: 'Catégories', f_category: 'Catégorie', f_slug: 'URL du produit (slug)',
      f_rating: 'Note (ex: 4.8)', f_reviews: 'Nombre d\'avis',
      f_images: 'Images du produit', publish: '🚀 Publier le produit', publishing: 'Publication...',
      success: '✅ Publié avec succès!', required: 'Veuillez remplir les champs requis',
      alt: 'Texte alternatif de l\'image', edit: 'Modifier', delete: 'Supprimer',
      confirm_delete: 'Êtes-vous sûr de vouloir supprimer?', update: '✏️ Enregistrer les modifications',
      add_new: '+ Ajouter un produit'
    }
  }[lang]

  const inp = {
    background: 'rgba(15,23,42,0.8)', border: '1.5px solid rgba(99,102,241,0.25)',
    color: '#f8fafc', borderRadius: 12, padding: '13px 18px', fontSize: 15,
    outline: 'none', width: '100%', fontFamily: 'Cairo,sans-serif',
    direction: dir, textAlign: dir === 'rtl' ? 'right' : 'left',
    boxSizing: 'border-box', transition: 'border 0.2s'
  }
  const lbl = {
    display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600,
    marginBottom: 8, direction: dir, textAlign: dir === 'rtl' ? 'right' : 'left'
  }

  const uploadImage = async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    return await res.json()
  }

  const handleImages = async (e) => {
    const files = Array.from(e.target.files)
    setLoading(true)
    const uploaded = []
    for (const file of files) {
      const alt = prompt(`${t.alt}: ${file.name}`) || file.name
      const result = await uploadImage(file)
      uploaded.push({ url: result.url, alt })
    }
    setForm(f => ({ ...f, images: [...f.images, ...uploaded] }))
    setLoading(false)
  }

  const handlePublish = async () => {
    if (!form.title || !form.price || !form.description) { setError(t.required); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/publish', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project, type: 'products',
          data: {
            ...form,
            slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, ''),
            labels: form.labels.split(',').map(l => l.trim()),
            features: form.features,
            benefits: form.benefits,
            rating: parseFloat(form.rating) || 4.8,
            reviewCount: parseInt(form.reviewCount) || 50,
            price: parseFloat(form.price) || 0,
            oldPrice: parseFloat(form.oldPrice) || 0,
          },
          editSlug: mode === 'edit' ? editSlug : null
        })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(t.success)
        setForm({ title: '', price: '', oldPrice: '', discountPercentage: '', description: '', detailedDescription: '', metaDescription: '', features: '', benefits: '', labels: '', category: '', slug: '', rating: '4.8', reviewCount: '50', images: [] })
        setMode('add')
      } else setError(data.error || 'Error')
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const handleDelete = async (slug) => {
    if (!confirm(t.confirm_delete)) return
    setLoading(true)
    try {
      const res = await fetch('/api/publish', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, type: 'products', slug })
      })
      const data = await res.json()
      if (data.success) setSuccess('✅ تم الحذف بنجاح')
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const handleEdit = (product) => {
    setEditSlug(product.slug)
    setForm({
      title: product.title || product.name || '',
      price: product.price?.toString() || '',
      oldPrice: product.oldPrice?.toString() || '',
      discountPercentage: product.discountPercentage || '',
      description: product.description || '',
      detailedDescription: product.detailedDescription || '',
      metaDescription: product.metaDescription || '',
      features: product.features || '',
      benefits: product.benefits || '',
      labels: Array.isArray(product.labels) ? product.labels.join(', ') : product.labels || '',
      category: product.category || '',
      slug: product.slug || '',
      rating: product.rating?.toString() || '4.8',
      reviewCount: product.reviewCount?.toString() || '50',
      images: product.images || []
    })
    setMode('edit')
  }

  if (!project) return null

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)', fontFamily: 'Cairo,sans-serif', padding: '32px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, direction: dir, flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', padding: '8px 16px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            {lang === 'ar' ? '→' : '←'} {t.back}
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc' }}>{mode === 'edit' ? t.update : t.title}</h1>
          <button onClick={() => setMode(mode === 'add' ? 'list' : 'add')}
            style={{ marginRight: 'auto', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', padding: '8px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
            {mode === 'add' || mode === 'edit' ? t.list : t.add_new}
          </button>
        </div>

        <div style={{ background: 'rgba(30,41,59,0.85)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 36, border: '1px solid rgba(99,102,241,0.15)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>{t.f_title} *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>{t.f_slug}</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="ex: serrure-x9-2026" style={inp}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
            </div>

            <div>
              <label style={lbl}>{t.f_price} *</label>
              <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type="number" style={inp}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
            </div>

            <div>
              <label style={lbl}>{t.f_oldPrice}</label>
              <input value={form.oldPrice} onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))} type="number" style={inp}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
            </div>

            <div>
              <label style={lbl}>{t.f_discount}</label>
              <input value={form.discountPercentage} onChange={e => setForm(f => ({ ...f, discountPercentage: e.target.value }))} placeholder="34%" style={inp}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
            </div>

            <div>
              <label style={lbl}>{t.f_category}</label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Serrure intelligente" style={inp}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
            </div>

            <div>
              <label style={lbl}>{t.f_rating}</label>
              <input value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} type="number" step="0.1" min="0" max="5" style={inp}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
            </div>

            <div>
              <label style={lbl}>{t.f_reviews}</label>
              <input value={form.reviewCount} onChange={e => setForm(f => ({ ...f, reviewCount: e.target.value }))} type="number" style={inp}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>{t.f_desc} *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                style={{ ...inp, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>{t.f_detailed}</label>
              <textarea value={form.detailedDescription} onChange={e => setForm(f => ({ ...f, detailedDescription: e.target.value }))} rows={5}
                style={{ ...inp, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>{t.f_meta}</label>
              <input value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} maxLength={160} style={inp}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
              <p style={{ color: form.metaDescription.length > 140 ? '#f59e0b' : '#475569', fontSize: 12, marginTop: 6, textAlign: 'left' }}>{form.metaDescription.length}/160</p>
            </div>

            <div>
              <label style={lbl}>{t.f_features}</label>
              <input value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder="Empreinte, Code, Carte" style={inp}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
            </div>

            <div>
              <label style={lbl}>{t.f_benefits}</label>
              <input value={form.benefits} onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))} placeholder="Sécurité, Design moderne" style={inp}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>{t.f_labels}</label>
              <input value={form.labels} onChange={e => setForm(f => ({ ...f, labels: e.target.value }))} style={inp}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'} onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>{t.f_images}</label>
              <label style={{ display: 'block', background: 'rgba(99,102,241,0.08)', border: '2px dashed rgba(99,102,241,0.3)', borderRadius: 12, padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'; e.currentTarget.style.background = 'rgba(99,102,241,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)' }}>
                <input type="file" multiple accept="image/*" onChange={handleImages} style={{ display: 'none' }} />
                <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                <p style={{ color: '#818cf8', fontWeight: 600, fontSize: 14 }}>{loading ? '⏳ جاري الرفع...' : lang === 'ar' ? 'اضغط لرفع الصور' : 'Cliquez pour ajouter des images'}</p>
              </label>
              {form.images.length > 0 && (
                <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                  {form.images.map((img, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={img.url} alt={img.alt} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '2px solid rgba(99,102,241,0.3)' }} />
                      <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                        style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.alt}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', margin: '16px 0', color: '#fca5a5', fontSize: 14 }}>⚠️ {error}</div>}
          {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '12px 16px', margin: '16px 0', color: '#6ee7b7', fontSize: 14, textAlign: 'center' }}>{success}</div>}

          <button onClick={handlePublish} disabled={loading}
            style={{ width: '100%', padding: '15px 0', background: loading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', borderRadius: 12, fontSize: 16, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 8px 24px rgba(99,102,241,0.35)', fontFamily: 'Cairo,sans-serif', marginTop: 8 }}>
            {loading ? t.publishing : (mode === 'edit' ? t.update : t.publish)}
          </button>
        </div>
      </div>
    </div>
  )
}
