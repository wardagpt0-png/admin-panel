import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

async function getFileSha(owner, repo, path) {
  try {
    const res = await octokit.repos.getContent({ owner, repo, path })
    return res.data.sha
  } catch { return null }
}

async function writeFile(owner, repo, path, content, message) {
  const sha = await getFileSha(owner, repo, path)
  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64')
  await octokit.repos.createOrUpdateFileContents({
    owner, repo, path, message, content: encoded,
    ...(sha && { sha }),
  })
}

async function deleteFile(owner, repo, path, message) {
  const sha = await getFileSha(owner, repo, path)
  if (!sha) return
  await octokit.repos.deleteFile({ owner, repo, path, message, sha })
}

export async function POST(req) {
  try {
    const { project, type, data, editSlug } = await req.json()
    const owner = project.github_owner
    const repo = project.github_repo

    const slug = data.slug || 
      (data.title || '').toLowerCase()
        .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u').replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '').replace(/\-\-+/g, '-')

    const item = {
      ...data,
      slug,
      name: data.title,
      publishedAt: new Date().toISOString(),
      schema: generateSchema(type, data, slug),
    }

    // Si modification → supprimer l'ancien fichier si slug différent
    if (editSlug && editSlug !== slug) {
      await deleteFile(owner, repo, `data/${type}/${editSlug}.json`, `supprimer ancien ${type}: ${editSlug}`)
    }

    await writeFile(owner, repo, `data/${type}/${slug}.json`, item, `${editSlug ? 'modifier' : 'ajouter'} ${type}: ${data.title}`)

    // Mettre à jour index.json
    let index = []
    try {
      const res = await octokit.repos.getContent({ owner, repo, path: `data/${type}/index.json` })
      index = JSON.parse(Buffer.from(res.data.content, 'base64').toString())
    } catch {}

    // Supprimer l'ancien entry si modification
    if (editSlug) {
      index = index.filter(p => p.slug !== editSlug)
    } else {
      index = index.filter(p => p.slug !== slug)
    }

    index.unshift({ 
      slug, 
      title: data.title, 
      name: data.title,
      price: data.price,
      oldPrice: data.oldPrice,
      discountPercentage: data.discountPercentage,
      category: data.category,
      image: data.images?.[0]?.url || '',
      images: data.images || [],
      publishedAt: item.publishedAt 
    })

    await writeFile(owner, repo, `data/${type}/index.json`, index, `mettre à jour index ${type}`)

    return NextResponse.json({ success: true, slug })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const { project, type, slug } = await req.json()
    const owner = project.github_owner
    const repo = project.github_repo

    await deleteFile(owner, repo, `data/${type}/${slug}.json`, `supprimer ${type}: ${slug}`)

    let index = []
    try {
      const res = await octokit.repos.getContent({ owner, repo, path: `data/${type}/index.json` })
      index = JSON.parse(Buffer.from(res.data.content, 'base64').toString())
    } catch {}

    index = index.filter(p => p.slug !== slug)
    await writeFile(owner, repo, `data/${type}/index.json`, index, `supprimer de index: ${slug}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function generateSchema(type, data, slug) {
  if (type === 'products') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.title,
      description: data.metaDescription || data.description,
      image: data.images?.map(i => i.url) || [],
      brand: { '@type': 'Brand', name: 'BALENCIA' },
      offers: {
        '@type': 'Offer',
        price: data.price,
        priceCurrency: 'MAD',
        availability: 'https://schema.org/InStock',
        url: `https://balencia-pr.vercel.app/product/${slug}`
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: data.rating || 4.8,
        reviewCount: data.reviewCount || 50
      }
    }
  }
  if (type === 'blogs') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.title,
      description: data.metaDescription,
      datePublished: new Date().toISOString(),
      image: data.images?.[0]?.url || '',
    }
  }
  return {}
}
