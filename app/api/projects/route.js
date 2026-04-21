import { NextResponse } from 'next/server'
import projects from '../../../data/projects/index.json'

export async function GET() {
  return NextResponse.json(projects)
}