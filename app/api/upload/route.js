import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME

    const uploadData = new FormData()
    uploadData.append('file', file)
    uploadData.append('upload_preset', 'admin-panel-unsigned')

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: uploadData }
    )

    const result = await response.json()

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      url: result.secure_url, 
      public_id: result.public_id 
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
