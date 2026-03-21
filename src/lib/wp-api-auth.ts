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
  const authHeader = request.headers.get('authorization') || ''
  const match = authHeader.match(/^Basic\s+(.+)$/i)
  if (!match) {
    return ''
  }

  try {
    const decoded = Buffer.from(match[1], 'base64').toString('utf8')
    const separatorIndex = decoded.indexOf(':')
    if (separatorIndex === -1) {
      return ''
    }
    return decoded.slice(separatorIndex + 1)
  } catch {
    return ''
  }
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

  if (
    bearerToken === normalizedExpected ||
    basicPassword === normalizedExpected
  ) {
    return null
  }

  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
}
