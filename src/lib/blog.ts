import { promises as fs } from 'node:fs'
import path from 'node:path'

const BLOG_DIRECTORY = path.join(process.cwd(), 'blog')

export interface BlogPost {
  slug: string
  title: string
  date: string
  modifiedAt: string
  excerpt: string
  content: string
  /** `html` = WordPress-style body; otherwise GitHub-flavored markdown */
  contentFormat: 'markdown' | 'html'
  status: 'publish' | 'draft'
  wpId: number | null
  categories: number[]
}

interface BlogFrontmatter {
  title?: string
  date?: string
  excerpt?: string
  /** `html` when body is raw HTML (e.g. from WordPress REST) */
  format?: string
  status?: string
  wp_id?: string
  categories?: string
}

function parseFrontmatter(rawContent: string): {
  frontmatter: BlogFrontmatter
  content: string
} {
  if (!rawContent.startsWith('---\n')) {
    return { frontmatter: {}, content: rawContent }
  }

  const endMarkerIndex = rawContent.indexOf('\n---\n', 4)
  if (endMarkerIndex === -1) {
    return { frontmatter: {}, content: rawContent }
  }

  const frontmatterBlock = rawContent.slice(4, endMarkerIndex)
  const body = rawContent.slice(endMarkerIndex + 5)
  const frontmatter: BlogFrontmatter = {}

  for (const line of frontmatterBlock.split('\n')) {
    const separatorIndex = line.indexOf(':')
    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')

    if (
      key === 'title' ||
      key === 'date' ||
      key === 'excerpt' ||
      key === 'format' ||
      key === 'status' ||
      key === 'wp_id' ||
      key === 'categories'
    ) {
      frontmatter[key] = value
    }
  }

  return { frontmatter, content: body }
}

function getTitle(content: string, fallback: string) {
  for (const line of content.split('\n')) {
    const trimmedLine = line.trim()
    if (trimmedLine.startsWith('# ')) {
      return trimmedLine.replace(/^#\s+/, '').trim()
    }
  }

  return fallback
}

function stripHtmlTags(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getExcerpt(content: string, contentFormat: 'markdown' | 'html') {
  if (contentFormat === 'html') {
    const text = stripHtmlTags(content)
    return text ? (text.length > 280 ? `${text.slice(0, 277)}…` : text) : ''
  }

  for (const line of content.split('\n')) {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }
    return trimmedLine
  }

  return ''
}

function getFallbackTitleFromSlug(slug: string) {
  return slug
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function getDate(dateFromFrontmatter: string | undefined, fallbackDate: Date) {
  const fallbackDateString = fallbackDate.toISOString().slice(0, 10)

  if (!dateFromFrontmatter) {
    return fallbackDateString
  }

  const parsedDate = new Date(dateFromFrontmatter)
  if (Number.isNaN(parsedDate.getTime())) {
    return fallbackDateString
  }

  return parsedDate.toISOString().slice(0, 10)
}

function getStatus(statusFromFrontmatter: string | undefined): BlogPost['status'] {
  if (!statusFromFrontmatter) {
    return 'publish'
  }
  return statusFromFrontmatter.toLowerCase() === 'draft' ? 'draft' : 'publish'
}

function parseWpId(wpIdFromFrontmatter: string | undefined) {
  if (!wpIdFromFrontmatter) {
    return null
  }
  const parsed = Number(wpIdFromFrontmatter)
  return Number.isInteger(parsed) ? parsed : null
}

function parseCategoryIds(categoriesFromFrontmatter: string | undefined) {
  if (!categoriesFromFrontmatter) {
    return []
  }

  const normalized = categoriesFromFrontmatter.trim()
  if (!normalized.startsWith('[') || !normalized.endsWith(']')) {
    return []
  }

  return normalized
    .slice(1, -1)
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value): value is number => Number.isInteger(value))
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  let fileNames: string[] = []

  try {
    fileNames = await fs.readdir(BLOG_DIRECTORY)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }

  const markdownFiles = fileNames.filter((fileName) => fileName.endsWith('.md'))

  const posts = await Promise.all(
    markdownFiles.map(async (fileName) => {
      const slug = fileName.replace(/\.md$/, '')
      const filePath = path.join(BLOG_DIRECTORY, fileName)
      const [rawContent, stats] = await Promise.all([
        fs.readFile(filePath, 'utf8'),
        fs.stat(filePath),
      ])

      const { frontmatter, content } = parseFrontmatter(rawContent)
      const fallbackTitle = getFallbackTitleFromSlug(slug)
      const contentFormat: BlogPost['contentFormat'] =
        frontmatter.format?.toLowerCase() === 'html' ? 'html' : 'markdown'
      const status = getStatus(frontmatter.status)

      return {
        slug,
        title: frontmatter.title || getTitle(content, fallbackTitle),
        excerpt: frontmatter.excerpt || getExcerpt(content, contentFormat),
        date: getDate(frontmatter.date, stats.mtime),
        modifiedAt: stats.mtime.toISOString(),
        content,
        contentFormat,
        status,
        wpId: parseWpId(frontmatter.wp_id),
        categories: parseCategoryIds(frontmatter.categories),
      }
    }),
  )

  return posts
    .filter((post) => post.status === 'publish')
    .sort((postA, postB) => postB.date.localeCompare(postA.date))
}

export async function getBlogPostBySlug(slug: string) {
  const posts = await getBlogPosts()
  return posts.find((post) => post.slug === slug)
}
