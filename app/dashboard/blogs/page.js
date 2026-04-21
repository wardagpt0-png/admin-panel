'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BlogsPage() {
  const [project, setProject] = useState(null)
  const [lang, setLang] = useState('ar')
  const [form, setForm] = useState({ title:'', content:'', metaDescription:'', labels:'', images:[] })
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

  const t = {
    ar: { title:'إضافة مقال جديد', back:'رجوع', f_title:'عنوان المقال', f_content:'محتوى المقال', f_meta:'وصف محركات البحث (SEO)', f_labels:'التصنيفات (مفصولة بفاصلة)', f_images:'صور المقال', publish:'🚀 نشر المقال', publishing:'جاري النشر...', success:'✅ تم نشر المقال بنجاح!', required:'يرجى ملء العنوان والمحتوى', alt:'أدخل النص البديل للصورة', p_title:'مثال: أفضل أحذية رياضية 2026', p_content:'اكتب محتوى المقال هنا...', p_meta:'وصف قصير يظهر في Google (160 حرف)', p_labels:'مثال: أحذية, رياضة, مراجعات', chars:'حرف' },
    fr: { title:'Ajouter un article', back:'Retour', f_title:"Titre de l'article", f_content:"Contenu de l'article", f_meta:'Description SEO', f_labels:'Catégories (séparées par virgule)', f_images:"Images de l'article", publish:"🚀 Publier l'article", publishing:'Publication...', success:'✅ Article publié avec succès!', required:'Veuillez remplir le titre et le contenu', alt:'Entrez le texte alternatif', p_title:'Ex: Meilleures chaussures 2026', p_content:"Écrivez votre article ici...", p_meta:'Description courte pour Google (160 chars)', p_labels:'Ex: chaussures, sport, avis', chars:'car.' }
  }[lang]

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const uploadImage = async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method:'POST', body:fd })
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
    if (!form.title || !form.content) { setError(t.required); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/publish', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ project, type:'blogs', data:{ ...form, labels: form.labels.split(',').map(l=>l.trim()) } })
      })
      const data = await res.json()
      if (data.success) { setSuccess(t.success); setForm({ title:'', content:'', metaDescription:'', labels:'', images:[] }) }
      else setError(data.error || 'Error')
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  const inp = { background:'rgba(15,23,42,0.8)', border:'1.5px solid rgba(99,102,241,0.25)', color:'#f8fafc', borderRadius:12, padding:'13px 18px', fontSize:15, outline:'none', width:'100%', fontFamily:'Cairo,sans-serif', direction:dir, textAlign:dir==='rtl'?'right':'left', boxSizing:'border-box', transition:'border 0.2s' }
  const lbl = { display:'block', color:'#94a3b8', fontSize:13, fontWeight:600, marginBottom:8, direction:dir, textAlign:dir==='rtl'?'right':'left' }

  if (!project) return null

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)', fontFamily:'Cairo,sans-serif', padding:'32px 20px'}}>
      <div style={{position:'fixed',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
        <div style={{position:'absolute',bottom:'5%',left:'5%',width:400,height:400,background:'radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%)',borderRadius:'50%'}}/>
      </div>

      <div style={{maxWidth:720, margin:'0 auto', position:'relative', zIndex:1}}>
        <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:32, direction:dir}}>
          <Link href="/dashboard" style={{display:'flex',alignItems:'center',gap:8,background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.25)',color:'#a78bfa',padding:'8px 16px',borderRadius:10,textDecoration:'none',fontSize:14,fontWeight:600}}>
            {lang==='ar'?'→':'←'} {t.back}
          </Link>
          <h1 style={{fontSize:24, fontWeight:800, color:'#f8fafc'}}>{t.title}</h1>
        </div>

        <div style={{background:'rgba(30,41,59,0.85)', backdropFilter:'blur(20px)', borderRadius:24, padding:36, border:'1px solid rgba(139,92,246,0.15)', boxShadow:'0 20px 60px rgba(0,0,0,0.4)'}}>
          <div style={{display:'grid', gap:20}}>
            <div>
              <label style={lbl}>{t.f_title} *</label>
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder={t.p_title} style={inp}
                onFocus={e=>e.target.style.borderColor='rgba(139,92,246,0.6)'} onBlur={e=>e.target.style.borderColor='rgba(99,102,241,0.25)'} />
            </div>
            <div>
              <label style={lbl}>{t.f_content} *</label>
              <textarea value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} placeholder={t.p_content} rows={8}
                style={{...inp, resize:'vertical'}}
                onFocus={e=>e.target.style.borderColor='rgba(139,92,246,0.6)'} onBlur={e=>e.target.style.borderColor='rgba(99,102,241,0.25)'} />
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
              <div>
                <label style={lbl}>{t.f_meta}</label>
                <input value={form.metaDescription} onChange={e=>setForm(f=>({...f,metaDescription:e.target.value}))} placeholder={t.p_meta} maxLength={160} style={inp}
                  onFocus={e=>e.target.style.borderColor='rgba(139,92,246,0.6)'} onBlur={e=>e.target.style.borderColor='rgba(99,102,241,0.25)'} />
                <p style={{color:form.metaDescription.length>140?'#f59e0b':'#475569', fontSize:12, marginTop:6, textAlign:'left'}}>{form.metaDescription.length}/160 {t.chars}</p>
              </div>
              <div>
                <label style={lbl}>{t.f_labels}</label>
                <input value={form.labels} onChange={e=>setForm(f=>({...f,labels:e.target.value}))} placeholder={t.p_labels} style={inp}
                  onFocus={e=>e.target.style.borderColor='rgba(139,92,246,0.6)'} onBlur={e=>e.target.style.borderColor='rgba(99,102,241,0.25)'} />
              </div>
            </div>
            <div>
              <label style={lbl}>{t.f_images}</label>
              <label style={{display:'block', background:'rgba(139,92,246,0.08)', border:'2px dashed rgba(139,92,246,0.3)', borderRadius:12, padding:'24px', textAlign:'center', cursor:'pointer', transition:'all 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(139,92,246,0.6)'; e.currentTarget.style.background='rgba(139,92,246,0.12)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(139,92,246,0.3)'; e.currentTarget.style.background='rgba(139,92,246,0.08)'}}>
                <input type="file" multiple accept="image/*" onChange={handleImages} style={{display:'none'}} />
                <div style={{fontSize:32, marginBottom:8}}>📸</div>
                <p style={{color:'#a78bfa', fontWeight:600, fontSize:14}}>{loading?'⏳ جاري الرفع...':lang==='ar'?'اضغط لرفع الصور':'Cliquez pour ajouter des images'}</p>
              </label>
              {form.images.length > 0 && (
                <div style={{display:'flex', gap:12, marginTop:16, flexWrap:'wrap'}}>
                  {form.images.map((img,i) => (
                    <div key={i}>
                      <img src={img.url} alt={img.alt} style={{width:80, height:80, objectFit:'cover', borderRadius:10, border:'2px solid rgba(139,92,246,0.3)'}} />
                      <p style={{fontSize:11, color:'#94a3b8', marginTop:4, textAlign:'center', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{img.alt}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && <div style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:'12px 16px', margin:'16px 0', color:'#fca5a5', fontSize:14, direction:dir, textAlign:dir==='rtl'?'right':'left'}}>⚠️ {error}</div>}
          {success && <div style={{background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:10, padding:'12px 16px', margin:'16px 0', color:'#6ee7b7', fontSize:14, textAlign:'center'}}>{success}</div>}

          <button onClick={handlePublish} disabled={loading}
            style={{width:'100%', padding:'15px 0', background:loading?'rgba(139,92,246,0.3)':'linear-gradient(135deg,#8b5cf6,#6366f1)', color:'white', borderRadius:12, fontSize:16, fontWeight:700, border:'none', cursor:loading?'not-allowed':'pointer', boxShadow:loading?'none':'0 8px 24px rgba(139,92,246,0.35)', fontFamily:'Cairo,sans-serif', marginTop:8, transition:'all 0.2s'}}>
            {loading ? t.publishing : t.publish}
          </button>
        </div>
      </div>
    </div>
  )
}
