import { NextResponse } from 'next/server'

const CATEGORIES = [
  { id: 1, count: 0, description: '', link: '/blog', name: 'General', slug: 'general' },
  {
    id: 2,
    count: 0,
    description: '',
    link: '/blog',
    name: 'Engineering',
    slug: 'engineering',
  },
  { id: 3, count: 0, description: '', link: '/blog', name: 'Product', slug: 'product' },
]

export async function GET() {
  return NextResponse.json(CATEGORIES)
}
