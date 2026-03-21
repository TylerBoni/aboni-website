import { NextResponse } from 'next/server'

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

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://abonitech.com').replace(
    /\/$/,
    '',
  )
}

export async function GET() {
  return NextResponse.json({
    name: 'Aboni Tech',
    description: 'WP-compatible API facade',
    url: siteUrl(),
    home: siteUrl(),
    namespaces: ['wp/v2'],
    authentication: {
      'application-passwords': {
        endpoints: {
          authorization: `${siteUrl()}/wp-admin/authorize-application.php`,
        },
      },
    },
    routes,
  })
}
