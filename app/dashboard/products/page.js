'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProductsPage() {
  const [project, setProject] = useState(null)
  const [form, setForm] = useState({
    title: '', price: '', description: '',
    metaDescription: '', labels: '', images: []
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const p = localStorage.getItem('project')
    if (!p) { router.push('/'); return }
    setProject(JSON.parse(p))
  }, [])

  const uploadImage = async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    return await res.json()
  }

  const handleImages = async (e) => {
    const files = Array.from(e.target.files)
    const alts = []
    for (const file of files) {
      const alt = prompt(`أدخل النص البديل (alt) للصورة: ${file.name}`) || file.name
      alts.push({ file, alt })
    }
    setLoading(true)
    const uploaded = []
    for (const { file, alt } of alts) {
      const result = await uploadImage(file)
      uploaded.push({ url: result.url, alt })
    }
    setForm(f => ({ ...f, images: [...f.images, ...uploaded] }))
    setLoading(false)
  }

  const handlePublish = async () => {
    if (!form.title || !form.price || !form.description) {
      setError('يرجى ملء جميع الحقول المطلوبة')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          type: 'products',
          data: { ...form, labels: form.labels.split(',').map(l => l.trim()) }
        })
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('✅ تم النشر بنجاح!')
        setForm({ title: '', price: '', description: '', metaDescription: '', labels: '', images: [] })
      } else {
        setError(data.error || 'حدث خطأ')
      }
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="text-blue-500 hover:underline">→ رجوع</Link>
          <h1 className="text-2xl font-bold text-gray-800">إضافة منتج جديد</h1>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المنتج *</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
              className="w-full border rounded-lg px-4 py-2 text-right focus:outline-none focus:border-blue-500"
              placeholder="مثال: حذاء رياضي نايك" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">السعر *</label>
            <input value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))}
              className="w-full border rounded-lg px-4 py-2 text-right focus:outline-none focus:border-blue-500"
              placeholder="مثال: 299" type="number" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وصف المنتج *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
              className="w-full border rounded-lg px-4 py-2 text-right focus:outline-none focus:border-blue-500"
              rows={4} placeholder="وصف تفصيلي للمنتج..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وصف محركات البحث (Meta Description)</label>
            <input value={form.metaDescription} onChange={e => setForm(f => ({...f, metaDescription: e.target.value}))}
              className="w-full border rounded-lg px-4 py-2 text-right focus:outline-none focus:border-blue-500"
              placeholder="وصف قصير لظهور في Google (160 حرف)" maxLength={160} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">التصنيفات (Labels) - مفصولة بفاصلة</label>
            <input value={form.labels} onChange={e => setForm(f => ({...f, labels: e.target.value}))}
              className="w-full border rounded-lg px-4 py-2 text-right focus:outline-none focus:border-blue-500"
              placeholder="مثال: أحذية, رياضة, نايك" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الصور</label>
            <input type="file" multiple accept="image/*" onChange={handleImages}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none" />
            {form.images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {form.images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img.url} alt={img.alt} className="w-20 h-20 object-cover rounded-lg" />
                    <p className="text-xs text-gray-500 mt-1 text-center">{img.alt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-sm text-right">{error}</p>}
          {success && <p className="text-green-500 text-sm text-right">{success}</p>}

          <button onClick={handlePublish} disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'جاري النشر...' : '🚀 نشر المنتج'}
          </button>
        </div>
      </div>
    </div>
  )
}