'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [project, setProject] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const res = await fetch('/api/projects')
    const projects = await res.json()
    const found = projects.find(
      p => p.password === password
    )
    if (found) {
      localStorage.setItem('project', JSON.stringify(found))
      router.push('/dashboard')
    } else {
      setError('كلمة المرور خاطئة')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          لوحة التحكم
        </h1>
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-right focus:outline-none focus:border-blue-500"
        />
        {error && (
          <p className="text-red-500 text-sm mb-4 text-right">{error}</p>
        )}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          دخول
        </button>
      </div>
    </div>
  )
}