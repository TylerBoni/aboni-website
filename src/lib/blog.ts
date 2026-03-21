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
}

interface BlogFrontmatter {
  title?: string
  date?: string
  excerpt?: string
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

    if (key === 'title' || key === 'date' || key === 'excerpt') {
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

function getExcerpt(content: string) {
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

      return {
        slug,
        title: frontmatter.title || getTitle(content, fallbackTitle),
        excerpt: frontmatter.excerpt || getExcerpt(content),
        date: getDate(frontmatter.date, stats.mtime),
        modifiedAt: stats.mtime.toISOString(),
        content,
      }
    }),
  )

  return posts.sort((postA, postB) => postB.date.localeCompare(postA.date))
}

export async function getBlogPostBySlug(slug: string) {
  const posts = await getBlogPosts()
  return posts.find((post) => post.slug === slug)
}
