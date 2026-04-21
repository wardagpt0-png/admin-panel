import './globals.css'

export const metadata = {
  title: 'Admin Panel',
  description: 'لوحة تحكم المواقع',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}