import { NextResponse } from 'next/server'

import {
  authorizeWpWriteRequest,
  getCurrentWpUser,
  wpUnauthorizedResponse,
} from '@/lib/wp-api-auth'

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://abonitech.com').replace(
    /\/$/,
    '',
  )
}

export async function GET(request: Request) {
  const auth = authorizeWpWriteRequest(request)
  if (auth) {
    return wpUnauthorizedResponse()
  }

  const user = getCurrentWpUser()
  return NextResponse.json({
    id: user.id,
    name: user.name,
    slug: user.slug,
    link: `${siteUrl()}/author/${user.slug}`,
    url: siteUrl(),
    description: '',
  })
}
