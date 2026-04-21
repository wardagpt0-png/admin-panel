'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function OrdersPage() {
  const [project, setProject] = useState(null)
  const [sheetUrl, setSheetUrl] = useState('')
  const router = useRouter()

  useEffect(() => {
    const p = localStorage.getItem('project')
    if (!p) { router.push('/'); return }
    const parsed = JSON.parse(p)
    setProject(parsed)
    setSheetUrl(parsed.sheet_url || '')
  }, [])

  if (!project) return null

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="text-blue-500 hover:underline">→ رجوع</Link>
          <h1 className="text-2xl font-bold text-gray-800">الطلبات</h1>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 space-y-6">

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h2 className="font-bold text-blue-800 mb-2">📋 كيف تعمل الطلبات؟</h2>
            <p className="text-blue-700 text-sm leading-relaxed">
              الطلبات تُحفظ تلقائياً في Google Sheets عندما يطلب الزوار من موقعك.
              لا تحتاج إلى قاعدة بيانات - Google Sheets يعمل دائماً ✅
            </p>
          </div>

          <div>
            <h2 className="font-bold text-gray-800 mb-3">🔗 رابط Google Sheets الخاص بالطلبات</h2>
            {sheetUrl ? (
              <a href={sheetUrl} target="_blank"
                className="block w-full bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-3 text-center hover:bg-green-100 transition font-medium">
                📊 فتح جدول الطلبات
              </a>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-yellow-800 text-sm font-medium mb-3">
                  ⚠️ لم يتم ربط Google Sheets بعد
                </p>
                <p className="text-yellow-700 text-sm leading-relaxed">
                  لإعداد نظام الطلبات، اتبع الخطوات التالية:
                </p>
                <ol className="text-yellow-700 text-sm mt-2 space-y-1 list-decimal list-inside">
                  <li>أنشئ Google Sheet جديد</li>
                  <li>أضف هذه الأعمدة: الاسم، الهاتف، المنتج، التاريخ</li>
                  <li>اذهب إلى Extensions → Apps Script</li>
                  <li>أضف الكود المرفق أدناه</li>
                  <li>أضف رابط الـ Sheet في إعدادات المشروع</li>
                </ol>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-bold text-gray-800 mb-3">📝 كود Google Apps Script</h2>
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-green-400 text-xs leading-relaxed">{`function doPost(e) {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.name,
    data.phone,
    data.product,
    data.message || ''
  ]);
  return ContentService
    .createTextOutput(
      JSON.stringify({success: true})
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );
}`}</pre>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-right">
              انسخ هذا الكود وضعه في Google Apps Script ثم انشره كـ Web App
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}