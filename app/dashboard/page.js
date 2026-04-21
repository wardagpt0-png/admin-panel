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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {project.name}
          </h1>
          <button
            onClick={() => { localStorage.clear(); router.push('/') }}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            خروج
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/products">
            <div className="bg-white rounded-2xl p-8 shadow hover:shadow-lg transition cursor-pointer text-center">
              <div className="text-5xl mb-4">📦</div>
              <h2 className="text-xl font-bold text-gray-800">المنتجات</h2>
              <p className="text-gray-500 mt-2">إضافة وإدارة المنتجات</p>
            </div>
          </Link>

          <Link href="/dashboard/blogs">
            <div className="bg-white rounded-2xl p-8 shadow hover:shadow-lg transition cursor-pointer text-center">
              <div className="text-5xl mb-4">📝</div>
              <h2 className="text-xl font-bold text-gray-800">المقالات</h2>
              <p className="text-gray-500 mt-2">إضافة وإدارة المقالات</p>
            </div>
          </Link>

          <Link href="/dashboard/orders">
            <div className="bg-white rounded-2xl p-8 shadow hover:shadow-lg transition cursor-pointer text-center">
              <div className="text-5xl mb-4">🛒</div>
              <h2 className="text-xl font-bold text-gray-800">الطلبات</h2>
              <p className="text-gray-500 mt-2">عرض الطلبات الواردة</p>
            </div>
          </Link>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-4 shadow text-center">
          
            href={project.url}
            target="_blank"
            className="text-blue-500 hover:underline font-medium"
          >
            🔗 زيارة الموقع
          </a>
        </div>
      </div>
    </div>
  )
}