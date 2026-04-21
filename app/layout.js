import './globals.css'

export const metadata = {
  title: 'Admin Panel | لوحة التحكم',
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
