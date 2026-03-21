import { createWpApiAdapterFromEnv } from '@/lib/wp-api-adapter'

const adapter = createWpApiAdapterFromEnv()

export const GET = adapter.categories.get
