import { type MetadataRoute } from 'next'

import { getBlogPosts } from '@/lib/blog'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://abonitech.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const posts = await getBlogPosts()

  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.modifiedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
