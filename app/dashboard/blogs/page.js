'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const RichEditor = dynamic(() => import('../../components/RichEditor'), { ssr: false })

export default function BlogsPage() {
  const [project, setProject] = useState(null)
  const [lang, setLang] = useState('fr')
  const [mode, setMode] = useState('list')
  const [blogsList, setBlogsList] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [editSlug, setEditSlug] = useState(null)
  const [form, setForm] = useState({
    title: '', content: '', metaDescription: '',
    labels: '', slug: '', images: []
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
    loadBlogs(proj)
  }, [])

  const loadBlogs = async (proj) => {
    setLoadingList(true)
    try {
      const res = await fetch(`/api/products?owner=${proj.github_owner}&repo=${proj.github_repo}&type=blogs`)
      const data = await res.json()
      setBlogsList(Array.isArray(data) ? data : [])
    } catch { setBlogsList([]) }
    setLoadingList(false)
  }

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const t = {
    ar: {
      title: 'إضافة مقال', edit_title: 'تعديل مقال', back: 'رجوع',
      list: 'القائمة', add_new: '+ مقال جديد',
      f_title: 'عنوان المقال *', f_content: 'محتوى المقال *',
      f_meta: 'Meta Description (SEO)', f_labels: 'التصنيفات (مفصولة بفاصلة)',
      f_slug: 'رابط المقال (slug)', f_images: 'صور المقال',
      publish: '🚀 نشر المقال', publishing: 'جاري...',
      update: '✏️ حفظ التعديلات',
      success_add: '✅ تم النشر!', success_update: '✅ تم التعديل!',
      success_delete: '✅ تم الحذف!', required: 'يرجى ملء الحقول المطلوبة',
      alt: 'النص البديل', edit: '✏️', delete: '🗑️',
      confirm_delete: 'هل أنت متأكد؟', no_blogs: 'لا توجد مقالات بعد',
    },
    fr: {
      title: 'Ajouter un article', edit_title: "Modifier l'article", back: 'Retour',
      list: 'Liste', add_new: '+ Nouvel article',
      f_title: "Titre de l'article *", f_content: "Contenu de l'article *",
      f_meta: 'Meta Description (SEO)', f_labels: 'Catégories (séparées par virgule)',
      f_slug: "URL de l'article (slug)", f_images: "Images de l'article",
      publish: "🚀 Publier l'article", publishing: 'Publication...',
      update: '✏️ Enregistrer',
      success_add: '✅ Publié!', success_update: '✅ Modifié!',
      success_delete: '✅ Supprimé!', required: 'Veuillez remplir les champs requis',
      alt: 'Texte alternatif', edit: '✏️', delete: '🗑️',
      confirm_delete: 'Êtes-vous sûr?', no_blogs: 'Aucun article',
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
    setForm({ title: '', content: '', metaDescription: '', labels: '', slug: '', images: [] })
    setEditSlug(null)
    setSuccess('')
    setError('')
  }

  const handleEdit = async (blog) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products?owner=${project.github_owner}&repo=${project.github_repo}&type=blogs&slug=${blog.slug}`)
      const full = await res.json()
      const b = full || blog
      setEditSlug(b.slug)
      setForm({
        title: b.title || '',
        content: b.content || '',
        metaDescription: b.metaDescription || '',
        labels: Array.isArray(b.labels) ? b.labels.join(', ') : b.labels || '',
        slug: b.slug || '',
        images: b.images || []
      })
      setMode('form')
      setSuccess('')
      setError('')
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const handleDelete = async (slug) => {
    if (!confirm(t.confirm_delete)) return
    setLoading(true)
    try {
      const res = await fetch('/api/publish', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, type: 'blogs', slug })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(t.success_delete)
        await loadBlogs(project)
      } else setError(data.error)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const handlePublish = async () => {
    if (!form.title || !form.content) { setError(t.required); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project, type: 'blogs',
          editSlug: editSlug,
          data: {
            ...form,
            slug: form.slug || form.title.toLowerCase()
              .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
              .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
              .replace(/[ùúûü]/g, 'u').replace(/\s+/g, '-')
              .replace(/[^\w\-]/g, ''),
            labels: typeof form.labels === 'string'
              ? form.labels.split(',').map(l => l.trim()).filter(Boolean)
              : form.labels,
          }
        })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(editSlug ? t.success_update : t.success_add)
        resetForm()
        setMode('list')
        await loadBlogs(project)
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
          <Link href="/dashboard" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa', padding: '8px 16px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
            {lang === 'ar' ? '→' : '←'} {t.back}
          </Link>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', flex: 1 }}>
            {mode === 'form' ? (editSlug ? t.edit_title : t.title) : t.list}
          </h1>
          {mode === 'list' ? (
            <button onClick={() => { resetForm(); setMode('form') }}
              style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: 'white', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Cairo,sans-serif' }}>
              {t.add_new}
            </button>
          ) : (
            <button onClick={() => { resetForm(); setMode('list') }}
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa', padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}>
              {t.list}
            </button>
          )}
        </div>

        {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#6ee7b7', fontSize: 14, textAlign: 'center' }}>{success}</div>}

        {/* LIST MODE */}
        {mode === 'list' && (
          <div style={{ background: 'rgba(30,41,59,0.85)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 24, border: '1px solid rgba(139,92,246,0.15)' }}>
            {loadingList ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>⏳ {lang === 'ar' ? 'جاري التحميل...' : 'Chargement...'}</p>
            ) : blogsList.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>{t.no_blogs}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {blogsList.map((blog) => (
                  <div key={blog.slug} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(15,23,42,0.6)', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(139,92,246,0.1)', direction: dir }}>
                    {blog.images?.[0]?.url && (
                      <img src={blog.images[0].url} alt={blog.title} style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#f8fafc', fontWeight: 700, fontSize: 15 }}>{blog.title}</p>
                      <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
                        {new Date(blog.publishedAt).toLocaleDateString('fr-FR')}
                        {blog.labels?.length > 0 && ` • ${Array.isArray(blog.labels) ? blog.labels.join(', ') : blog.labels}`}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => handleEdit(blog)}
                        style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontFamily: 'Cairo,sans-serif' }}>
                        {t.edit}
                      </button>
                      <button onClick={() => handleDelete(blog.slug)}
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
          <div style={{ background: 'rgba(30,41,59,0.85)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: 36, border: '1px solid rgba(139,92,246,0.15)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>{t.f_title}</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp}
                  onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>{t.f_slug}</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="ex: guide-serrure-intelligente-2026" style={inp}
                  onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>{t.f_meta}</label>
                <input value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                  maxLength={160} style={inp}
                  onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
                <p style={{ color: form.metaDescription.length > 140 ? '#f59e0b' : '#475569', fontSize: 12, marginTop: 6, textAlign: 'left' }}>
                  {form.metaDescription.length}/160
                </p>
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>{t.f_labels}</label>
                <input value={form.labels} onChange={e => setForm(f => ({ ...f, labels: e.target.value }))}
                  placeholder="ex: sécurité, guide, conseil" style={inp}
                  onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.25)'} />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>{t.f_content}</label>
                <RichEditor
                  value={form.content}
                  onChange={val => setForm(f => ({ ...f, content: val }))}
                  onUploadImage={async (file) => {
                    const fd = new FormData()
                    fd.append('file', file)
                    const r = await fetch('/api/upload', { method: 'POST', body: fd })
                    return await r.json()
                  }}
                />
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>{t.f_images}</label>
                <label style={{ display: 'block', background: 'rgba(139,92,246,0.08)', border: '2px dashed rgba(139,92,246,0.3)', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)'; e.currentTarget.style.background = 'rgba(139,92,246,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; e.currentTarget.style.background = 'rgba(139,92,246,0.08)' }}>
                  <input type="file" multiple accept="image/*" onChange={handleImages} style={{ display: 'none' }} />
                  <div style={{ fontSize: 28, marginBottom: 6 }}>📸</div>
                  <p style={{ color: '#a78bfa', fontSize: 14, fontWeight: 600 }}>
                    {loading ? '⏳...' : lang === 'ar' ? 'اضغط لرفع الصور' : 'Cliquez pour ajouter des images'}
                  </p>
                </label>
                {form.images.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                    {form.images.map((img, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={img.url} alt={img.alt} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid rgba(139,92,246,0.3)' }} />
                        <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                          style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, fontSize: 10, cursor: 'pointer' }}>✕</button>
                        <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img.alt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', margin: '16px 0', color: '#fca5a5', fontSize: 14 }}>⚠️ {error}</div>}

            <button onClick={handlePublish} disabled={loading}
              style={{ width: '100%', padding: '15px 0', background: loading ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: 'white', borderRadius: 12, fontSize: 16, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Cairo,sans-serif', marginTop: 16 }}>
              {loading ? t.publishing : (editSlug ? t.update : t.publish)}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
