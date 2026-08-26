import { createClient, createConfig } from '@/generated/client'
import type { ClientOptions } from '@/generated/client'

const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

export const apiClient = createClient(createConfig<ClientOptions>({ baseUrl }))
