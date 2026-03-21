import { createWpApiAdapterFromEnv } from '@/lib/wp-api-adapter'

const adapter = createWpApiAdapterFromEnv()

export const HEAD = adapter.apiRoot.head
export const GET = adapter.apiRoot.get
