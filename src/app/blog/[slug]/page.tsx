import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogPostBody } from '@/components/BlogPostBody'
import { Container } from '@/components/Container'
import { formatDate } from '@/lib/formatDate'
import { getBlogPostBySlug, getBlogPosts } from '@/lib/blog'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return {}
  }

  return {
    title: post.title,
    description: post.excerpt || `Blog post: ${post.title}`,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt || `Blog post: ${post.title}`,
      url: `/blog/${post.slug}`,
      publishedTime: new Date(post.date).toISOString(),
      modifiedTime: post.modifiedAt,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <Container as="article" className="mt-24 sm:mt-32 lg:mt-40">
      <header className="mx-auto max-w-3xl">
        <time className="text-sm text-neutral-500" dateTime={post.date}>
          {formatDate(post.date)}
        </time>
        <h1 className="mt-4 font-display text-5xl font-medium tracking-tight text-neutral-950 sm:text-6xl">
          {post.title}
        </h1>
      </header>

      <div className="mx-auto mt-16 max-w-3xl">
        <BlogPostBody content={post.content} contentFormat={post.contentFormat} />
      </div>
    </Container>
  )
}
