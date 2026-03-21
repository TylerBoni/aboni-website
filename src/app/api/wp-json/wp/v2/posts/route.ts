import { createWpApiAdapterFromEnv } from '@/lib/wp-api-adapter'

const adapter = createWpApiAdapterFromEnv()

export const POST = adapter.posts.post
