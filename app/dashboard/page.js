'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [project, setProject] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const p = localStorage.getItem('project')
    if (!p) { router.push('/'); return }
    setProject(JSON.parse(p))
  }, [])

  if (!project) return null

  return (
    <div style={{minHeight:'100vh',background:'#f3f4f6',padding:'2rem'}}>
      <div style={{maxWidth:'900px',margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'2rem'}}>
          <h1 style={{fontSize:'1.8rem',fontWeight:'bold'}}>{project.name}</h1>
          <button onClick={() => { localStorage.clear(); router.push('/') }}
            style={{color:'red',background:'none',border:'none',cursor:'pointer',fontSize:'1rem'}}>
            خروج
          </button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.5rem'}}>
          <Link href="/dashboard/products" style={{textDecoration:'none'}}>
            <div style={{background:'white',borderRadius:'1rem',padding:'2rem',textAlign:'center',boxShadow:'0 2px 10px rgba(0,0,0,0.1)',cursor:'pointer'}}>
              <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📦</div>
              <h2 style={{fontSize:'1.2rem',fontWeight:'bold',color:'#1f2937'}}>المنتجات</h2>
              <p style={{color:'#6b7280',marginTop:'0.5rem'}}>إضافة وإدارة المنتجات</p>
            </div>
          </Link>
          <Link href="/dashboard/blogs" style={{textDecoration:'none'}}>
            <div style={{background:'white',borderRadius:'1rem',padding:'2rem',textAlign:'center',boxShadow:'0 2px 10px rgba(0,0,0,0.1)',cursor:'pointer'}}>
              <div style={{fontSize:'3rem',marginBottom:'1rem'}}>📝</div>
              <h2 style={{fontSize:'1.2rem',fontWeight:'bold',color:'#1f2937'}}>المقالات</h2>
              <p style={{color:'#6b7280',marginTop:'0.5rem'}}>إضافة وإدارة المقالات</p>
            </div>
          </Link>
          <Link href="/dashboard/orders" style={{textDecoration:'none'}}>
            <div style={{background:'white',borderRadius:'1rem',padding:'2rem',textAlign:'center',boxShadow:'0 2px 10px rgba(0,0,0,0.1)',cursor:'pointer'}}>
              <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🛒</div>
              <h2 style={{fontSize:'1.2rem',fontWeight:'bold',color:'#1f2937'}}>الطلبات</h2>
              <p style={{color:'#6b7280',marginTop:'0.5rem'}}>عرض الطلبات الواردة</p>
            </div>
          </Link>
        </div>
        <div style={{marginTop:'1.5rem',background:'white',borderRadius:'1rem',padding:'1rem',textAlign:'center',boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
          <a href={project.url} target="_blank" style={{color:'#3b82f6',fontWeight:'bold',textDecoration:'none'}}>
            زيارة الموقع 🔗
          </a>
        </div>
      </div>
    </div>
  )
}
