import { type Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { PageIntro } from '@/components/PageIntro'
import { formatDate } from '@/lib/formatDate'
import { getBlogPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Product updates, notes, and technical write-ups.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog',
    description: 'Product updates, notes, and technical write-ups.',
    url: '/blog',
  },
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <>
      <PageIntro eyebrow="Blog" title="Latest posts">
        <p>Product updates, notes, and technical write-ups.</p>
      </PageIntro>

      <Container className="">
        {posts.length === 0 ? (
          <p className="text-lg text-neutral-600">
            No posts yet. Add a `.md` file inside the `blog` folder.
          </p>
        ) : (
          <div className="space-y-10">
            {posts.map((post) => (
              <article key={post.slug} className="border-t border-neutral-200 pt-8">
                <p className="text-sm text-neutral-500">{formatDate(post.date)}</p>
                <h2 className="mt-2 font-display text-3xl font-medium text-neutral-950">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                {post.excerpt ? (
                  <p className="mt-3 max-w-3xl text-base text-neutral-600">
                    {post.excerpt}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </Container>
    </>
  )
}
