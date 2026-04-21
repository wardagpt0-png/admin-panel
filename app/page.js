'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [lang, setLang] = useState('ar')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const t = {
    ar: { title: 'لوحة التحكم', sub: 'أدخل كلمة المرور للدخول', pass: 'كلمة المرور', btn: 'دخول', err: 'كلمة المرور خاطئة', loading: 'جاري التحقق...' },
    fr: { title: 'Panneau Admin', sub: 'Entrez votre mot de passe', pass: 'Mot de passe', btn: 'Connexion', err: 'Mot de passe incorrect', loading: 'Vérification...' }
  }[lang]

  const handleLogin = async () => {
    if (!password) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/projects')
      const projects = await res.json()
      const found = projects.find(p => p.password === password)
      if (found) {
        localStorage.setItem('project', JSON.stringify(found))
        localStorage.setItem('lang', lang)
        router.push('/dashboard')
      } else {
        setError(t.err)
      }
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)'}}>
      <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
        <div style={{position:'absolute',top:'20%',left:'10%',width:400,height:400,background:'radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',bottom:'20%',right:'10%',width:300,height:300,background:'radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)',borderRadius:'50%'}}/>
      </div>

      <div style={{width:'100%',maxWidth:420,padding:'0 20px',position:'relative',zIndex:1}}>
        <div style={{background:'rgba(30,41,59,0.8)',backdropFilter:'blur(20px)',borderRadius:24,padding:40,border:'1px solid rgba(99,102,241,0.2)',boxShadow:'0 25px 50px rgba(0,0,0,0.5)'}}>

          <div style={{textAlign:'center',marginBottom:32}}>
            <div style={{width:64,height:64,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 16px',boxShadow:'0 8px 24px rgba(99,102,241,0.4)'}}>⚡</div>
            <h1 style={{fontSize:26,fontWeight:800,color:'#f8fafc',marginBottom:6}}>{t.title}</h1>
            <p style={{color:'#94a3b8',fontSize:14}}>{t.sub}</p>
          </div>

          <div style={{display:'flex',gap:8,marginBottom:24,background:'rgba(15,23,42,0.6)',borderRadius:12,padding:4}}>
            {['ar','fr'].map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{flex:1,padding:'8px 0',borderRadius:8,fontSize:13,fontWeight:600,background:lang===l?'linear-gradient(135deg,#6366f1,#8b5cf6)':'transparent',color:lang===l?'white':'#94a3b8',border:'none',cursor:'pointer',transition:'all 0.2s'}}>
                {l === 'ar' ? '🇲🇦 العربية' : '🇫🇷 Français'}
              </button>
            ))}
          </div>

          <div style={{marginBottom:16}}>
            <input
              type="password"
              placeholder={t.pass}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              dir={lang==='ar'?'rtl':'ltr'}
              style={{width:'100%',background:'rgba(15,23,42,0.8)',border:'1.5px solid rgba(99,102,241,0.3)',color:'#f8fafc',borderRadius:12,padding:'14px 18px',fontSize:15,outline:'none',textAlign:lang==='ar'?'right':'left',fontFamily:'Cairo,sans-serif',boxSizing:'border-box'}}
            />
          </div>

          {error && (
            <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:10,padding:'10px 14px',marginBottom:16,color:'#fca5a5',fontSize:13,textAlign:'center'}}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading}
            style={{width:'100%',padding:'14px 0',background:loading?'#334155':'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',borderRadius:12,fontSize:16,fontWeight:700,border:'none',cursor:loading?'not-allowed':'pointer',boxShadow:loading?'none':'0 8px 24px rgba(99,102,241,0.4)',transition:'all 0.2s',fontFamily:'Cairo,sans-serif'}}>
            {loading ? t.loading : t.btn}
          </button>
        </div>
      </div>
    </div>
  )
}
