import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')
    const type = searchParams.get('type') || 'products'

    const res = await octokit.repos.getContent({ 
      owner, repo, 
      path: `data/${type}/index.json` 
    })
    const content = JSON.parse(
      Buffer.from(res.data.content, 'base64').toString()
    )
    return NextResponse.json(content)
  } catch (error) {
    return NextResponse.json([], { status: 200 })
  }
}
