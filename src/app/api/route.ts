import { NextResponse } from 'next/server'

function baseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://abonitech.com').replace(
    /\/$/,
    '',
  )
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      'x-wp-mock-api': 'true',
      'x-wp-json-root': `${baseUrl()}/api/wp-json`,
      'access-control-allow-origin': '*',
    },
  })
}

export async function GET() {
  return NextResponse.json(
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
  )
}
