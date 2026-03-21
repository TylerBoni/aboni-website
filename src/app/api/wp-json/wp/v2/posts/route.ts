import { NextResponse } from 'next/server'

import {
  getGitHubConfig,
  getRepoFile,
  listRepoDirectory,
  upsertRepoFile,
} from '@/lib/github-content-api'

function getBearerToken(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || ''
}

function authorize(request: Request) {
  const apiToken = process.env.WP_API_TOKEN
  if (!apiToken) {
    return NextResponse.json(
      { message: 'WP_API_TOKEN is not configured' },
      { status: 500 },
    )
  }

  if (getBearerToken(request) !== apiToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  return null
}

function readWpField(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object') {
    const maybeRaw = (value as { raw?: unknown }).raw
    if (typeof maybeRaw === 'string') {
      return maybeRaw
    }

    const maybeRendered = (value as { rendered?: unknown }).rendered
    if (typeof maybeRendered === 'string') {
      return maybeRendered
    }
  }

  return ''
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function quoteYaml(value: string) {
  return `'${value.replace(/'/g, "''")}'`
}

function formatDate(input: string) {
  if (!input) {
    return new Date().toISOString().slice(0, 10)
  }
  const parsed = new Date(input)
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10)
  }
  return parsed.toISOString().slice(0, 10)
}

function buildPostMarkdown(params: {
  title: string
  date: string
  excerpt: string
  wpId: number
  status: string
  categories: number[]
  content: string
}) {
  const { title, date, excerpt, wpId, status, categories, content } = params
  const frontmatterLines = [
    '---',
    `title: ${quoteYaml(title)}`,
    `date: ${date}`,
    `excerpt: ${quoteYaml(excerpt)}`,
    'format: html',
    `wp_id: ${wpId}`,
    `status: ${status === 'publish' ? 'publish' : 'draft'}`,
    categories.length > 0 ? `categories: [${categories.join(', ')}]` : 'categories: []',
    '---',
    '',
  ]

  return `${frontmatterLines.join('\n')}${content}\n`
}

function parseWpIdFromFile(content: string) {
  const match = content.match(/^wp_id:\s*(\d+)\s*$/m)
  if (!match) {
    return null
  }
  return Number(match[1])
}

export async function POST(request: Request) {
  const authResponse = authorize(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const payload = (await request.json()) as {
      id?: number
      slug?: string
      title?: unknown
      content?: unknown
      excerpt?: unknown
      date?: string
      status?: string
      categories?: number[]
    }

    const github = getGitHubConfig()
    const title = readWpField(payload.title) || 'Untitled'
    const content = readWpField(payload.content)
    const excerpt = readWpField(payload.excerpt)
    const status = payload.status || 'draft'
    const categories = Array.isArray(payload.categories)
      ? payload.categories.filter((value): value is number => Number.isInteger(value))
      : []
    const slug = slugify(payload.slug || title) || `post-${Date.now()}`
    const targetWpId = Number.isInteger(payload.id) ? Number(payload.id) : Date.now()
    const date = formatDate(payload.date || '')

    const directoryItems = await listRepoDirectory(github, 'blog')
    const markdownFiles = directoryItems.filter(
      (item) => item.type === 'file' && item.name.endsWith('.md'),
    )

    let existingPath = `blog/${slug}.md`
    let existingSha: string | undefined

    if (Number.isInteger(payload.id)) {
      for (const item of markdownFiles) {
        const existing = await getRepoFile(github, item.path)
        if (!existing) {
          continue
        }
        if (parseWpIdFromFile(existing.content) === payload.id) {
          existingPath = item.path
          existingSha = existing.sha
          break
        }
      }
    }

    if (!existingSha) {
      const bySlug = await getRepoFile(github, existingPath)
      if (bySlug) {
        existingSha = bySlug.sha
      }
    }

    const markdown = buildPostMarkdown({
      title,
      date,
      excerpt,
      wpId: targetWpId,
      status,
      categories,
      content,
    })

    await upsertRepoFile({
      config: github,
      filePath: existingPath,
      content: markdown,
      sha: existingSha,
      message: `${existingSha ? 'Update' : 'Create'} post: ${existingPath}`,
    })

    return NextResponse.json({
      id: targetWpId,
      slug: existingPath.replace(/^blog\//, '').replace(/\.md$/, ''),
      status: status === 'publish' ? 'publish' : 'draft',
      date,
      title: { raw: title, rendered: title },
      excerpt: { raw: excerpt, rendered: excerpt },
      content: { raw: content, rendered: content, protected: false },
      link: `/blog/${existingPath.replace(/^blog\//, '').replace(/\.md$/, '')}`,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Failed to upsert post' }, { status: 500 })
  }
}
