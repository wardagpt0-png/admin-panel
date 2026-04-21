'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/projects')
      const projects = await res.json()
      const found = projects.find(p => p.password === password)
      if (found) {
        localStorage.setItem('project', JSON.stringify(found))
        router.push('/dashboard')
      } else {
        setError('كلمة المرور خاطئة')
      }
    } catch(e) {
      setError('حدث خطأ: ' + e.message)
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f3f4f6'}}>
      <div style={{background:'white',padding:'2rem',borderRadius:'1rem',boxShadow:'0 4px 20px rgba(0,0,0,0.1)',width:'100%',maxWidth:'360px'}}>
        <h1 style={{textAlign:'center',marginBottom:'1.5rem',fontSize:'1.5rem',fontWeight:'bold'}}>لوحة التحكم</h1>
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{width:'100%',border:'1px solid #d1d5db',borderRadius:'0.5rem',padding:'0.75rem 1rem',marginBottom:'1rem',textAlign:'right',fontSize:'1rem',boxSizing:'border-box'}}
        />
        {error && <p style={{color:'red',marginBottom:'1rem',textAlign:'right'}}>{error}</p>}
        <button
          onClick={handleLogin}
          style={{width:'100%',background:'#2563eb',color:'white',padding:'0.75rem',borderRadius:'0.5rem',fontWeight:'bold',fontSize:'1rem',cursor:'pointer',border:'none'}}
        >
          دخول
        </button>
      </div>
    </div>
  )
}
