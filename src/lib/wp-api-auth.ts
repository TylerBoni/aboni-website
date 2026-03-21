import { NextResponse } from 'next/server'

function normalizeToken(value: string) {
  return value.replace(/[\s-]+/g, '').toLowerCase()
}

function getBearerToken(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || ''
}

function getBasicPassword(request: Request) {
  const credentials = getBasicCredentials(request)
  return credentials?.password || ''
}

function getBasicCredentials(request: Request) {
  const authHeader = request.headers.get('authorization') || ''
  const match = authHeader.match(/^Basic\s+(.+)$/i)
  if (!match) {
    return null
  }

  try {
    const decoded = Buffer.from(match[1], 'base64').toString('utf8')
    const separatorIndex = decoded.indexOf(':')
    if (separatorIndex === -1) {
      return null
    }
    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    }
  } catch {
    return null
  }
}

function expectedWpUsername() {
  return (
    process.env.WP_API_USERNAME ||
    process.env.WP_ADMIN_USERNAME ||
    process.env.WP_ADMIN_EMAIL ||
    ''
  )
}

export function getCurrentWpUser() {
  const username = expectedWpUsername() || 'wp-api-user'
  const slug = username
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return {
    id: 1,
    name: username,
    slug: slug || 'wp-api-user',
  }
}

export function wpUnauthorizedResponse() {
  return NextResponse.json(
    {
      code: 'rest_not_logged_in',
      message: 'You are not currently logged in.',
      data: { status: 401 },
    },
    { status: 401 },
  )
}

export function authorizeWpWriteRequest(request: Request) {
  const configuredToken =
    process.env.WP_APPLICATION_PASSWORD || process.env.WP_API_TOKEN || ''
  if (!configuredToken) {
    return NextResponse.json(
      { message: 'WP_APPLICATION_PASSWORD or WP_API_TOKEN is not configured' },
      { status: 500 },
    )
  }

  const normalizedExpected = normalizeToken(configuredToken)
  const bearerToken = normalizeToken(getBearerToken(request))
  const basicPassword = normalizeToken(getBasicPassword(request))
  const basicCredentials = getBasicCredentials(request)
  const configuredUsername = expectedWpUsername()
  const usernameValid =
    !configuredUsername ||
    !basicCredentials ||
    basicCredentials.username.toLowerCase() === configuredUsername.toLowerCase()

  if (
    usernameValid &&
    (bearerToken === normalizedExpected || basicPassword === normalizedExpected)
  ) {
    return null
  }

  return wpUnauthorizedResponse()
}
