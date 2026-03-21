import { Buffer } from 'node:buffer'

import { NextResponse } from 'next/server'

import {
  getGitHubConfig,
  getRepoFile,
  listRepoDirectory,
  upsertRepoFile,
} from '@/lib/github-content-api'
import {
  authorizeWpWriteRequest,
  getCurrentWpUser,
  wpUnauthorizedResponse,
} from '@/lib/wp-api-auth'

interface WpCategory {
  id: number
  count: number
  description: string
  link: string
  name: string
  slug: string
}

interface WpApiAdapterOptions {
  siteUrl?: string
  blogDirectory?: string
  uploadsDirectory?: string
  categories?: WpCategory[]
}

const DEFAULT_CATEGORIES: WpCategory[] = [
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

function normalizeSiteUrl(url: string) {
  return url.replace(/\/$/, '')
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

function sanitizeFilename(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseFilenameFromContentDisposition(headerValue: string | null) {
  if (!headerValue) {
    return ''
  }
  const match = headerValue.match(/filename="?([^"]+)"?/i)
  return match?.[1]?.trim() || ''
}

export function createWpApiAdapter(options: WpApiAdapterOptions = {}) {
  const siteUrl = normalizeSiteUrl(
    options.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://abonitech.com',
  )
  const blogDirectory = options.blogDirectory || 'blog'
  const uploadsDirectory = options.uploadsDirectory || 'public/uploads'
  const categories = options.categories || DEFAULT_CATEGORIES

  const routes = {
    '/wp/v2': {
      namespace: 'wp/v2',
    },
    '/wp/v2/posts': {
      namespace: 'wp/v2',
      methods: ['POST'],
    },
    '/wp/v2/media': {
      namespace: 'wp/v2',
      methods: ['POST'],
    },
    '/wp/v2/categories': {
      namespace: 'wp/v2',
      methods: ['GET'],
    },
    '/wp/v2/users/me': {
      namespace: 'wp/v2',
      methods: ['GET'],
    },
  }

  return {
    apiRoot: {
      head: async () =>
        new Response(null, {
          status: 200,
          headers: {
            'x-wp-mock-api': 'true',
            'x-wp-json-root': `${siteUrl}/api/wp-json`,
            'access-control-allow-origin': '*',
          },
        }),
      get: async () =>
        NextResponse.json(
          {
            ok: true,
            name: 'WP-compatible API root',
            endpoints: {
              posts: '/api/wp-json/wp/v2/posts',
              media: '/api/wp-json/wp/v2/media',
              categories: '/api/wp-json/wp/v2/categories',
            },
            wp_json: '/api/wp-json',
          },
          {
            status: 200,
            headers: {
              'access-control-allow-origin': '*',
            },
          },
        ),
    },
    discovery: {
      get: async () =>
        NextResponse.json({
          name: 'Aboni Tech',
          description: 'WP-compatible API facade',
          url: siteUrl,
          home: siteUrl,
          namespaces: ['wp/v2'],
          authentication: {
            'application-passwords': {
              endpoints: {
                authorization: `${siteUrl}/wp-admin/authorize-application.php`,
              },
            },
          },
          routes,
        }),
    },
    users: {
      me: {
        get: async (request: Request) => {
          const auth = authorizeWpWriteRequest(request)
          if (auth) {
            return wpUnauthorizedResponse()
          }

          const user = getCurrentWpUser()
          return NextResponse.json({
            id: user.id,
            name: user.name,
            slug: user.slug,
            link: `${siteUrl}/author/${user.slug}`,
            url: siteUrl,
            description: '',
          })
        },
      },
    },
    categories: {
      get: async () => NextResponse.json(categories),
    },
    posts: {
      post: async (request: Request) => {
        const authResponse = authorizeWpWriteRequest(request)
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
          const postCategories = Array.isArray(payload.categories)
            ? payload.categories.filter(
                (value): value is number => Number.isInteger(value),
              )
            : []
          const slug = slugify(payload.slug || title) || `post-${Date.now()}`
          const targetWpId = Number.isInteger(payload.id)
            ? Number(payload.id)
            : Date.now()
          const date = formatDate(payload.date || '')

          const directoryItems = await listRepoDirectory(github, blogDirectory)
          const markdownFiles = directoryItems.filter(
            (item) => item.type === 'file' && item.name.endsWith('.md'),
          )

          let existingPath = `${blogDirectory}/${slug}.md`
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
            categories: postCategories,
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
            slug: existingPath
              .replace(new RegExp(`^${blogDirectory}/`), '')
              .replace(/\.md$/, ''),
            status: status === 'publish' ? 'publish' : 'draft',
            date,
            title: { raw: title, rendered: title },
            excerpt: { raw: excerpt, rendered: excerpt },
            content: { raw: content, rendered: content, protected: false },
            link: `/blog/${existingPath
              .replace(new RegExp(`^${blogDirectory}/`), '')
              .replace(/\.md$/, '')}`,
          })
        } catch (error) {
          console.error(error)
          return NextResponse.json(
            { message: 'Failed to upsert post' },
            { status: 500 },
          )
        }
      },
    },
    media: {
      post: async (request: Request) => {
        const authResponse = authorizeWpWriteRequest(request)
        if (authResponse) {
          return authResponse
        }

        try {
          const contentType = request.headers.get('content-type') || ''
          let fileName = ''
          let binaryContent: Buffer | null = null

          if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData()
            const fileField =
              formData.get('file') ||
              formData.get('media') ||
              formData.get('upload')

            if (!(fileField instanceof File)) {
              return NextResponse.json(
                { message: 'No file found in form-data' },
                { status: 400 },
              )
            }

            fileName = fileField.name
            binaryContent = Buffer.from(await fileField.arrayBuffer())
          } else {
            fileName =
              parseFilenameFromContentDisposition(
                request.headers.get('content-disposition'),
              ) || `upload-${Date.now()}`
            binaryContent = Buffer.from(await request.arrayBuffer())
          }

          if (!binaryContent || binaryContent.length === 0) {
            return NextResponse.json(
              { message: 'Empty file upload' },
              { status: 400 },
            )
          }

          const safeName = sanitizeFilename(fileName || `upload-${Date.now()}`)
          const filePath = `${uploadsDirectory}/${safeName}`
          const github = getGitHubConfig()
          const existing = await getRepoFile(github, filePath)

          await upsertRepoFile({
            config: github,
            filePath,
            content: binaryContent,
            sha: existing?.sha,
            message: `${existing ? 'Update' : 'Upload'} media: ${filePath}`,
          })

          const sourcePath = `/${uploadsDirectory.replace(/^public\//, '')}/${safeName}`

          return NextResponse.json({
            id: Date.now(),
            file: safeName,
            media_type: 'image',
            source_url: `${siteUrl}${sourcePath}`,
          })
        } catch (error) {
          console.error(error)
          return NextResponse.json(
            { message: 'Failed to upload media' },
            { status: 500 },
          )
        }
      },
    },
  }
}

export function createWpApiAdapterFromEnv() {
  return createWpApiAdapter()
}
