import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

async function getFileSha(owner, repo, path) {
  try {
    const res = await octokit.repos.getContent({ owner, repo, path })
    return res.data.sha
  } catch {
    return null
  }
}

async function writeFile(owner, repo, path, content, message) {
  const sha = await getFileSha(owner, repo, path)
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64')
  await octokit.repos.createOrUpdateFileContents({
    owner, repo, path,
    message,
    content: encoded,
    ...(sha && { sha }),
  })
}

export async function POST(req) {
  try {
    const { project, type, data } = await req.json()
    const owner = project.github_owner
    const repo = project.github_repo

    // توليد slug من العنوان
    const slug = data.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]/g, '')
      + '-' + Date.now()

    const item = {
      ...data,
      slug,
      publishedAt: new Date().toISOString(),
      schema: generateSchema(type, data),
    }

    // حفظ الملف الفردي
    await writeFile(owner, repo, `data/${type}/${slug}.json`, item, `نشر ${type}: ${data.title}`)

    // تحديث index.json
    let index = []
    try {
      const res = await octokit.repos.getContent({ owner, repo, path: `data/${type}/index.json` })
      index = JSON.parse(Buffer.from(res.data.content, 'base64').toString())
    } catch {}

    index.unshift({ slug, title: data.title, publishedAt: item.publishedAt })
    await writeFile(owner, repo, `data/${type}/index.json`, index, `تحديث index ${type}`)

    return NextResponse.json({ success: true, slug })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function generateSchema(type, data) {
  if (type === 'products') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',