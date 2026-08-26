<script setup lang="ts">
import { useOwnerQuery } from '@/composables/useApi'
import { RouterView, RouterLink } from 'vue-router'

const { data: owner, isLoading } = useOwnerQuery()
</script>

<template>
  <div class="app-shell">
    <header class="header-glass sticky top-0 z-30">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            M
          </div>
          <span class="font-bold text-xl tracking-tight text-gray-900">Meetflow</span>
        </div>

        <div class="flex items-center gap-4">
          <div v-if="owner" class="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <span class="font-medium">{{ owner.name }}</span>
            <span class="w-2 h-2 rounded-full bg-success-500"></span>
          </div>
          <div v-else-if="isLoading" class="skeleton w-24 h-5"></div>
          <RouterLink
            to="/admin"
            class="text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
          >
            Админка
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <div class="max-w-6xl mx-auto px-6 py-10">
        <RouterView />
      </div>
    </main>

    <footer class="border-t border-gray-200 bg-white">
      <div class="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-gray-400">
        <span>Meetflow</span>
        <span>Простое бронирование встреч</span>
      </div>
    </footer>
  </div>
</template>
