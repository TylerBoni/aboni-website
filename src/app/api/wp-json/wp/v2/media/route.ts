import { Buffer } from 'node:buffer'

import { NextResponse } from 'next/server'

import { getGitHubConfig, getRepoFile, upsertRepoFile } from '@/lib/github-content-api'
import { authorizeWpWriteRequest } from '@/lib/wp-api-auth'

function sanitizeFilename(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseFilenameFromContentDisposition(headerValue: string | null) {
  if (!headerValue) {
    return ''
  }
  const match = headerValue.match(/filename="?([^"]+)"?/i)
  return match?.[1]?.trim() || ''
}

export async function POST(request: Request) {
  const authResponse = authorizeWpWriteRequest(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const contentType = request.headers.get('content-type') || ''
    let fileName = ''
    let binaryContent: Buffer | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const fileField =
        formData.get('file') || formData.get('media') || formData.get('upload')

      if (!(fileField instanceof File)) {
        return NextResponse.json(
          { message: 'No file found in form-data' },
          { status: 400 },
        )
      }

      fileName = fileField.name
      binaryContent = Buffer.from(await fileField.arrayBuffer())
    } else {
      fileName =
        parseFilenameFromContentDisposition(
          request.headers.get('content-disposition'),
        ) || `upload-${Date.now()}`
      binaryContent = Buffer.from(await request.arrayBuffer())
    }

    if (!binaryContent || binaryContent.length === 0) {
      return NextResponse.json({ message: 'Empty file upload' }, { status: 400 })
    }

    const safeName = sanitizeFilename(fileName || `upload-${Date.now()}`)
    const filePath = `public/uploads/${safeName}`
    const github = getGitHubConfig()
    const existing = await getRepoFile(github, filePath)

    await upsertRepoFile({
      config: github,
      filePath,
      content: binaryContent,
      sha: existing?.sha,
      message: `${existing ? 'Update' : 'Upload'} media: ${filePath}`,
    })

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
    const sourcePath = `/uploads/${safeName}`

    return NextResponse.json({
      id: Date.now(),
      file: safeName,
      media_type: 'image',
      source_url: siteUrl ? `${siteUrl}${sourcePath}` : sourcePath,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Failed to upload media' }, { status: 500 })
  }
}
