import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE_FILES = [
  'src/lib/github-content-api.ts',
  'src/lib/wp-api-auth.ts',
  'src/lib/wp-api-adapter.ts',
  'src/app/api/route.ts',
  'src/app/api/wp-json/route.ts',
  'src/app/api/wp-json/wp/v2/posts/route.ts',
  'src/app/api/wp-json/wp/v2/media/route.ts',
  'src/app/api/wp-json/wp/v2/categories/route.ts',
  'src/app/api/wp-json/wp/v2/users/me/route.ts',
  'src/app/wp-json/route.ts',
  'src/app/wp-json/wp/v2/posts/route.ts',
  'src/app/wp-json/wp/v2/media/route.ts',
  'src/app/wp-json/wp/v2/categories/route.ts',
  'src/app/wp-json/wp/v2/users/me/route.ts',
]

function printUsage() {
  console.log(
    [
      'Usage:',
      '  node scripts/copy-wp-api-adapter.mjs <target-nextjs-project-path> [--force]',
      '',
      'Examples:',
      '  node scripts/copy-wp-api-adapter.mjs /Users/me/source/my-next-app',
      '  node scripts/copy-wp-api-adapter.mjs ../another-site --force',
    ].join('\n'),
  )
}

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help') || args.includes('-h')) {
    printUsage()
    process.exit(0)
  }

  const force = args.includes('--force')
  const positionalArgs = args.filter((arg) => !arg.startsWith('--'))
  const targetArg = positionalArgs[0]

  if (!targetArg) {
    printUsage()
    process.exit(1)
  }

  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
  const sourceProjectRoot = path.resolve(scriptDirectory, '..')
  const targetProjectRoot = path.resolve(process.cwd(), targetArg)

  const targetStats = await fs.stat(targetProjectRoot).catch(() => null)
  if (!targetStats || !targetStats.isDirectory()) {
    throw new Error(`Target path is not a directory: ${targetProjectRoot}`)
  }

  const targetPackageJson = path.join(targetProjectRoot, 'package.json')
  if (!(await exists(targetPackageJson))) {
    console.warn(`Warning: no package.json found at ${targetProjectRoot}`)
  }

  const copied = []
  const skipped = []

  for (const relativePath of SOURCE_FILES) {
    const sourcePath = path.join(sourceProjectRoot, relativePath)
    const destinationPath = path.join(targetProjectRoot, relativePath)

    if (!(await exists(sourcePath))) {
      throw new Error(`Source file missing: ${sourcePath}`)
    }

    const destinationExists = await exists(destinationPath)
    if (destinationExists && !force) {
      skipped.push(relativePath)
      continue
    }

    await fs.mkdir(path.dirname(destinationPath), { recursive: true })
    await fs.copyFile(sourcePath, destinationPath)
    copied.push(relativePath)
  }

  console.log(`\nTarget: ${targetProjectRoot}`)
  console.log(`Copied ${copied.length} file(s).`)
  if (copied.length > 0) {
    console.log(copied.map((item) => `  + ${item}`).join('\n'))
  }

  if (skipped.length > 0) {
    console.log(`\nSkipped ${skipped.length} existing file(s) (use --force to overwrite):`)
    console.log(skipped.map((item) => `  - ${item}`).join('\n'))
  }

  console.log('\nRemember to configure env vars in the target project:')
  console.log(
    [
      '  WP_APPLICATION_PASSWORD (or WP_API_TOKEN)',
      '  WP_API_USERNAME (optional)',
      '  GITHUB_TOKEN (or GITHUB_PAT)',
      '  GITHUB_REPO_OWNER',
      '  GITHUB_REPO_NAME',
      '  GITHUB_REPO_BRANCH',
      '  NEXT_PUBLIC_SITE_URL',
    ].join('\n'),
  )
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
