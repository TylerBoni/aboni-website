import { Buffer } from 'node:buffer'

interface GitHubConfig {
  token: string
  owner: string
  repo: string
  branch: string
}

interface GitHubFile {
  path: string
  sha: string
  content: string
}

interface GitHubListItem {
  type: string
  path: string
  name: string
  sha: string
}

function encodeGitHubPath(pathValue: string) {
  return pathValue
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function firstPresentEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name]
    if (value) {
      return value
    }
  }
  throw new Error(`Missing required environment variable: ${names.join(' or ')}`)
}

export function getGitHubConfig(): GitHubConfig {
  return {
    token: firstPresentEnv(['GITHUB_TOKEN', 'GITHUB_PAT']),
    owner: requiredEnv('GITHUB_REPO_OWNER'),
    repo: requiredEnv('GITHUB_REPO_NAME'),
    branch: process.env.GITHUB_REPO_BRANCH || 'main',
  }
}

async function githubRequest(
  config: GitHubConfig,
  pathname: string,
  init?: RequestInit,
) {
  const response = await fetch(`https://api.github.com${pathname}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.headers || {}),
    },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`GitHub API error ${response.status}: ${body}`)
  }

  return response
}

export async function getRepoFile(
  config: GitHubConfig,
  filePath: string,
): Promise<GitHubFile | null> {
  const endpoint = `/repos/${config.owner}/${config.repo}/contents/${encodeGitHubPath(filePath)}?ref=${encodeURIComponent(config.branch)}`
  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`GitHub API error ${response.status}: ${body}`)
  }

  const payload = (await response.json()) as {
    path: string
    sha: string
    content?: string
    encoding?: string
  }

  const rawContent =
    payload.encoding === 'base64' && payload.content
      ? Buffer.from(payload.content.replace(/\n/g, ''), 'base64').toString('utf8')
      : ''

  return {
    path: payload.path,
    sha: payload.sha,
    content: rawContent,
  }
}

export async function listRepoDirectory(
  config: GitHubConfig,
  directoryPath: string,
): Promise<GitHubListItem[]> {
  const endpoint = `/repos/${config.owner}/${config.repo}/contents/${encodeGitHubPath(directoryPath)}?ref=${encodeURIComponent(config.branch)}`
  const response = await githubRequest(config, endpoint)
  return (await response.json()) as GitHubListItem[]
}

export async function upsertRepoFile(params: {
  config: GitHubConfig
  filePath: string
  content: string | Buffer
  message: string
  sha?: string
}) {
  const { config, filePath, content, message, sha } = params
  const endpoint = `/repos/${config.owner}/${config.repo}/contents/${encodeGitHubPath(filePath)}`
  const response = await githubRequest(config, endpoint, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content:
        typeof content === 'string'
          ? Buffer.from(content, 'utf8').toString('base64')
          : content.toString('base64'),
      sha,
      branch: config.branch,
    }),
  })

  return response.json()
}
