import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'
    const dataUri = `data:${mimeType};base64,${base64}`

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    const timestamp = Math.round(Date.now() / 1000)
    const str = `folder=admin-panel&timestamp=${timestamp}${apiSecret}`
    
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const uploadData = new FormData()
    uploadData.append('file', dataUri)
    uploadData.append('api_key', apiKey)
    uploadData.append('timestamp', timestamp)
    uploadData.append('signature', signature)
    uploadData.append('folder', 'admin-panel')

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: uploadData }
    )

    const result = await response.json()
    
    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ url: result.secure_url, public_id: result.public_id })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
