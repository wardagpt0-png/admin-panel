'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [project, setProject] = useState(null)
  const [lang, setLang] = useState('ar')
  const router = useRouter()

  useEffect(() => {
    const p = localStorage.getItem('project')
    const l = localStorage.getItem('lang') || 'ar'
    if (!p) { router.push('/'); return }
    setProject(JSON.parse(p))
    setLang(l)
  }, [])

  if (!project) return null

  const t = {
    ar: { products:'المنتجات', products_desc:'إضافة وإدارة المنتجات', blogs:'المقالات', blogs_desc:'إضافة وإدارة المقالات', orders:'الطلبات', orders_desc:'عرض الطلبات الواردة', visit:'زيارة الموقع', logout:'خروج' },
    fr: { products:'Produits', products_desc:'Ajouter et gérer les produits', blogs:'Articles', blogs_desc:'Ajouter et gérer les articles', orders:'Commandes', orders_desc:'Voir les commandes', visit:'Visiter le site', logout:'Déconnexion' }
  }[lang]

  const cards = [
    { href:'/dashboard/products', icon:'📦', title:t.products, desc:t.products_desc, color:'#6366f1' },
    { href:'/dashboard/blogs', icon:'📝', title:t.blogs, desc:t.blogs_desc, color:'#8b5cf6' },
    { href:'/dashboard/orders', icon:'🛒', title:t.orders, desc:t.orders_desc, color:'#06b6d4' },
  ]

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)',padding:'0',fontFamily:'Cairo,sans-serif'}}>
      <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
        <div style={{position:'absolute',top:'10%',left:'5%',width:500,height:500,background:'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',bottom:'10%',right:'5%',width:400,height:400,background:'radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)',borderRadius:'50%'}}/>
      </div>

      <div style={{position:'relative',zIndex:1,maxWidth:1100,margin:'0 auto',padding:'40px 24px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:48,direction:lang==='ar'?'rtl':'ltr'}}>
          <div>
            <p style={{color:'#94a3b8',fontSize:14,marginBottom:4}}>{lang==='ar'?'مرحباً بك في':'Bienvenue sur'}</p>
            <h1 style={{fontSize:28,fontWeight:800,color:'#f8fafc'}}>{project.name}</h1>
          </div>
          <button onClick={() => { localStorage.clear(); router.push('/') }}
            style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#fca5a5',padding:'10px 20px',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'Cairo,sans-serif'}}>
            {t.logout}
          </button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:24,marginBottom:24,direction:lang==='ar'?'rtl':'ltr'}}>
          {cards.map(card => (
            <Link key={card.href} href={card.href} style={{textDecoration:'none'}}>
              <div style={{background:'rgba(30,41,59,0.8)',backdropFilter:'blur(20px)',borderRadius:20,padding:32,border:'1px solid rgba(99,102,241,0.15)',boxShadow:'0 8px 32px rgba(0,0,0,0.3)',cursor:'pointer',transition:'all 0.3s',textAlign:'center'}}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.5)'; e.currentTarget.style.boxShadow='0 16px 48px rgba(99,102,241,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='rgba(99,102,241,0.15)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.3)' }}>
                <div style={{width:64,height:64,background:`linear-gradient(135deg,${card.color}33,${card.color}22)`,border:`1px solid ${card.color}44`,borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 20px'}}>
                  {card.icon}
                </div>
                <h2 style={{fontSize:20,fontWeight:700,color:'#f8fafc',marginBottom:8}}>{card.title}</h2>
                <p style={{color:'#94a3b8',fontSize:14,lineHeight:1.6}}>{card.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <a href={project.url} target="_blank" style={{display:'block',textDecoration:'none'}}>
          <div style={{background:'rgba(30,41,59,0.6)',backdropFilter:'blur(20px)',borderRadius:16,padding:'16px 24px',border:'1px solid rgba(99,102,241,0.15)',textAlign:'center',color:'#818cf8',fontWeight:600,fontSize:15,transition:'all 0.2s',direction:lang==='ar'?'rtl':'ltr'}}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; e.currentTarget.style.color='#a5b4fc' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.15)'; e.currentTarget.style.color='#818cf8' }}>
            🔗 {t.visit} — {project.url}
          </div>
        </a>
      </div>
    </div>
  )
}
