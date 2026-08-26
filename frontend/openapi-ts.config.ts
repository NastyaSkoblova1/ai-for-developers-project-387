import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: '../tsp-output/schema/openapi.yaml',
  output: 'src/generated',
  client: '@hey-api/client-fetch',
})
