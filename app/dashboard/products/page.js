'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from "next/dynamic"
import CategorySelector from "../../components/CategorySelector"

const RichEditor = dynamic(() => import('../../components/RichEditor'), { ssr: false })

export default function ProductsPage() {
  const [project, setProject] = useState(null)
  const [lang, setLang] = useState('ar')
  const [mode, setMode] = useState('list')
  const [productsList, setProductsList] = useState([])
  const [loadingList, setLoadingList] = useState(true)
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
    const l = localStorage.getItem('lang') || 'fr'
    if (!p) { router.push('/'); return }
    const proj = JSON.parse(p)
    setProject(proj)
    setLang(l)
    loadProducts(proj)
  }, [])

  const loadProducts = async (proj) => {
    setLoadingList(true)
    try {
      const res = await fetch(`/api/products?owner=${proj.github_owner}&repo=${proj.github_repo}&type=products`)
      const data = await res.json()
      setProductsList(Array.isArray(data) ? data : [])
    } catch { setProductsList([]) }
    setLoadingList(false)
  }

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const t = {
    ar: {
      title: 'إضافة منتج', edit_title: 'تعديل منتج', back: 'رجوع',
      list: 'القائمة', add_new: '+ منتج جديد',
      f_title: 'اسم المنتج *', f_price: 'السعر (درهم) *',
      f_oldPrice: 'السعر قبل التخفيض', f_discount: 'نسبة التخفيض (مثال: 34%)',
      f_desc: 'الوصف المختصر *', f_detailed: 'الوصف التفصيلي',
      f_meta: 'Meta Description (SEO)', f_features: 'المميزات',
      f_benefits: 'الفوائد', f_labels: 'التصنيفات',
      f_category: 'الفئة', f_slug: 'رابط المنتج (slug)',
      f_rating: 'التقييم', f_reviews: 'عدد التقييمات', f_images: 'الصور',
      publish: '�� نشر', publishing: 'جاري...', update: '✏️ حفظ التعديلات',
      success_add: '✅ تم النشر!', success_update: '✅ تم التعديل!',
      success_delete: '✅ تم الحذف!', required: 'يرجى ملء الحقول المطلوبة',
      alt: 'النص البديل', edit: '✏️', delete: '🗑️',
      confirm_delete: 'هل أنت متأكد؟', no_products: 'لا توجد منتجات بعد',
    },
    fr: {
      title: 'Ajouter un produit', edit_title: 'Modifier le produit', back: 'Retour',
      list: 'Liste', add_new: '+ Nouveau produit',
      f_title: 'Nom du produit *', f_price: 'Prix (MAD) *',
      f_oldPrice: 'Prix avant réduction', f_discount: 'Réduction (ex: 34%)',
      f_desc: 'Description courte *', f_detailed: 'Description détaillée',
      f_meta: 'Meta Description (SEO)', f_features: 'Caractéristiques',
      f_benefits: 'Avantages', f_labels: 'Catégories',
      f_category: 'Catégorie', f_slug: 'URL du produit (slug)',
      f_rating: 'Note', f_reviews: "Nombre d'avis", f_images: 'Images',
      publish: '🚀 Publier', publishing: 'Publication...', update: '✏️ Enregistrer',
      success_add: '✅ Publié!', success_update: '✅ Modifié!',
      success_delete: '✅ Supprimé!', required: 'Remplissez les champs requis',
      alt: 'Texte alternatif', edit: '✏️', delete: '🗑️',
      confirm_delete: 'Êtes-vous sûr?', no_products: 'Aucun produit',
    }
  }[lang]

  const inp = {
    background: 'rgba(15,23,42,0.8)', border: '1.5px solid rgba(99,102,241,0.25)',
    color: '#f8fafc', borderRadius: 12, padding: '13px 18px', fontSize: 15,
    outline: 'none', width: '100%', fontFamily: 'Cairo,sans-serif',
    direction: dir, textAlign: dir === 'rtl' ? 'right' : 'left',
    boxSizing: 'border-box'
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
      if (result.url) uploaded.push({ url: result.url, alt })
    }
    setForm(f => ({ ...f, images: [...f.images, ...uploaded] }))
    setLoading(false)
  }

  const resetForm = () => {
    setForm({
      title: '', price: '', oldPrice: '', discountPercentage: '',
      description: '', detailedDescription: '', metaDescription: '',
      features: '', benefits: '', labels: '', category: '',
      slug: '', rating: '4.8', reviewCount: '50', images: []
    })
    setEditSlug(null)
    setSuccess('')
    setError('')
  }

  const handleEdit = async (product) => {
    setLoading(true)
    try {
      const res = await fetch('/api/products?owner=' + project.github_owner + '&repo=' + project.github_repo + '&type=products&slug=' + product.slug)
      const fullProduct = await res.json()
      const p = fullProduct || product
      setEditSlug(p.slug)
      setForm({
        title: p.title || p.name || '',
        price: p.price?.toString() || '',
        oldPrice: p.oldPrice?.toString() || '',
        discountPercentage: p.discountPercentage || '',
        description: p.description || '',
        detailedDescription: p.detailedDescription || '',
        metaDescription: p.metaDescription || '',
        features: p.features || '',
        benefits: p.benefits || '',
        labels: Array.isArray(p.labels) ? p.labels.join(', ') : p.labels || '',
        category: p.category || '',
        slug: p.slug || '',
        rating: p.rating?.toString() || '4.8',
        reviewCount: p.reviewCount?.toString() || '50',
        images: p.images || []
      })
      setMode('form')
      setSuccess('')
      setError('')
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  const handleDelete = async (slug) => {
    if (!confirm(t.confirm_delete)) return
    setLoading(true)
    try {
      const res = await fetch('/api/publish', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, type: 'products', slug })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(t.success_delete)
        await loadProducts(project)
      } else setError(data.error)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const handlePublish = async () => {
    if (!form.title || !form.price || !form.description) { setError(t.required); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project, type: 'products',
          editSlug: editSlug,
          data: {
            ...form,
            slug: form.slug || form.title.toLowerCase()
              .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
              .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
              .replace(/[ùúûü]/g, 'u').replace(/\s+/g, '-')
              .replace(/[^\w\-]/g, ''),
            labels: typeof form.labels === 'string' ? form.labels.split(',').map(l => l.trim()) : form.labels,
            price: parseFloat(form.price) || 0,
            oldPrice: parseFloat(form.oldPrice) || 0,
            rating: parseFloat(form.rating) || 4.8,
            reviewCount: parseInt(form.reviewCount) || 50,
          }
        })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(editSlug ? t.success_update : t.success_add)
        resetForm()
        setMode('list')
        await loadProducts(project)
      } else setError(data.error || 'Erreur')
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  if (!project) return null

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)', fontFamily: 'Cairo,sans-serif', padding: '32px 20px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, flexWrap: 'wrap', direction: dir }}>
          <Link href="/dashboard" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', padding: '8px 16px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            {lang === 'ar' ? '→' : '←'} {t.back}
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', flex: 1 }}>
            {mode === 'form' ? (editSlug ? t.edit_title : t.title) : t.list}
          </h1>
          {mode === 'list' ? (
            <button onClick={() => { resetForm(); setMode('form') }}
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Cairo,sans-serif' }}>
              {t.add_new}
            </button>
          ) : (
            <button onClick={() => { resetForm(); setMode('list') }}
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
              {t.list}
            </button>
          )}
        </div>

        {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#6ee7b7', fontSize: 14, textAlign: 'center' }}>{success}</div>}

        {/* LIST MODE */}
        {mode === 'list' && (
          <div style={{ background: 'rgba(30,41,59,0.85)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 24, border: '1px solid rgba(99,102,241,0.15)' }}>
            {loadingList ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>⏳ {lang === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</p>
            ) : productsList.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>{t.no_products}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {productsList.map((product) => (
                  <div key={product.slug} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(15,23,42,0.6)', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(99,102,241,0.1)', direction: dir }}>
                    {product.images?.[0]?.url && (
                      <img src={product.images[0].url} alt={product.images[0].alt} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#f8fafc', fontWeight: 700, fontSize: 15 }}>{product.title || product.name}</p>
                      <p style={{ color: '#94a3b8', fontSize: 13 }}>{product.price} MAD • {product.category}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEdit(product)}
                        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>
                        {t.edit}
                      </button>
                      <button onClick={() => handleDelete(product.slug)}
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>
                        {t.delete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FORM MODE */}
        {mode === 'form' && (
          <div style={{ background: 'rgba(30,41,59,0.85)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 36, border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>{t.f_title}</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>{t.f_slug}</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="ex: serrure-x9-2026" style={inp} />
              </div>

              <div>
                <label style={lbl}>{t.f_price}</label>
                <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type="number" style={inp} />
              </div>

              <div>
                <label style={lbl}>{t.f_oldPrice}</label>
                <input value={form.oldPrice} onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))} type="number" style={inp} />
              </div>

              <div>
                <label style={lbl}>{t.f_discount}</label>
                <input value={form.discountPercentage} onChange={e => setForm(f => ({ ...f, discountPercentage: e.target.value }))} placeholder="34%" style={inp} />
              </div>

              <div>
                <label style={lbl}>{t.f_category}</label>
                <CategorySelector value={form.category} onChange={val => setForm(f => ({ ...f, category: val }))} lang={lang} />
              </div>

              <div>
                <label style={lbl}>{t.f_rating}</label>
                <input value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} type="number" step="0.1" min="0" max="5" style={inp} />
              </div>

              <div>
                <label style={lbl}>{t.f_reviews}</label>
                <input value={form.reviewCount} onChange={e => setForm(f => ({ ...f, reviewCount: e.target.value }))} type="number" style={inp} />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>{t.f_desc}</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical' }} />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>{t.f_detailed}</label>
                <RichEditor value={form.detailedDescription} onChange={val => setForm(f => ({ ...f, detailedDescription: val }))} onUploadImage={async (file) => { const fd = new FormData(); fd.append("file", file); const r = await fetch("/api/upload", {method:"POST",body:fd}); return await r.json(); }} />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>{t.f_meta}</label>
                <input value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} maxLength={160} style={inp} />
                <input value={form.labels} onChange={e => setForm(f => ({ ...f, labels: e.target.value }))} style={inp} />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>{t.f_images}</label>
                <label style={{ display: 'block', background: 'rgba(99,102,241,0.08)', border: '2px dashed rgba(99,102,241,0.3)', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer' }}>
                  <input type="file" multiple accept="image/*" onChange={handleImages} style={{ display: 'none' }} />
                  <div style={{ fontSize: 28, marginBottom: 6 }}>📸</div>
                  <p style={{ color: '#818cf8', fontSize: 14, fontWeight: 600 }}>{loading ? '⏳...' : lang === 'ar' ? 'اضغط لرفع الصور' : 'Cliquez pour ajouter'}</p>
                </label>
                {form.images.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                    {form.images.map((img, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={img.url} alt={img.alt} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '2px solid rgba(99,102,241,0.3)' }} />
                        <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                          style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
            </div>
            </div>

            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', margin: '16px 0', color: '#fca5a5', fontSize: 14 }}>⚠️ {error}</div>}

            <button onClick={handlePublish} disabled={loading}
              style={{ width: '100%', padding: '15px 0', background: loading ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', borderRadius: 12, fontSize: 16, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Cairo,sans-serif', marginTop: 16 }}>
              {loading ? t.publishing : (editSlug ? t.update : t.publish)}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
