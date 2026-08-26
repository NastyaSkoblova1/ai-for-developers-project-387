<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useOwnerQuery } from '@/composables/useApi'

const route = useRoute()
const router = useRouter()
const { data: owner } = useOwnerQuery()
const mobileMenuOpen = ref(false)

const navItems = [
  { label: 'Dashboard', icon: 'pi pi-home', to: '/admin' },
  { label: 'Типы встреч', icon: 'pi pi-calendar-plus', to: '/admin/event-types' },
  { label: 'Бронирования', icon: 'pi pi-calendar', to: '/admin/bookings' },
]

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

function navigate(to: string) {
  mobileMenuOpen.value = false
  router.push(to)
}
</script>

<template>
  <div class="app-shell flex flex-col md:flex-row">
    <!-- Mobile Header -->
    <div class="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-20 relative">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">M</div>
        <span class="font-bold text-gray-900">Meetflow Admin</span>
      </div>
      <button
        class="w-10 h-10 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <i v-if="!mobileMenuOpen" class="pi pi-bars text-lg"></i>
        <i v-else class="pi pi-times text-lg"></i>
      </button>
    </div>

    <!-- Mobile Drawer -->
    <div
      v-if="mobileMenuOpen"
      class="md:hidden fixed inset-0 z-10"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="mobileMenuOpen = false"></div>
      <!-- Menu -->
      <div class="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
        <div class="p-5 border-b border-gray-100">
          <div class="font-bold text-lg text-gray-900 mb-1">Меню</div>
          <div class="text-xs text-gray-400">Административный режим</div>
        </div>
        <nav class="flex-1 p-3 flex flex-col gap-1">
          <button
            v-for="item in navItems"
            :key="item.to"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            :class="isActive(item.to)
              ? 'bg-primary-50 text-primary-700 shadow-sm'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            "
            @click="navigate(item.to)"
          >
            <i :class="item.icon" class="text-lg"></i>
            {{ item.label }}
          </button>
        </nav>
        <div class="p-4 border-t border-gray-100">
          <div v-if="owner" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50">
            <div class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
              {{ owner.name.charAt(0) }}
            </div>
            <div class="min-w-0">
              <div class="text-sm font-medium text-gray-900 truncate">{{ owner.name }}</div>
              <div class="text-xs text-gray-400 truncate">{{ owner.email }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Sidebar -->
    <aside class="sidebar-modern hidden md:flex w-64 min-h-screen sticky top-0 flex-col flex-shrink-0">
      <div class="p-5 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-lg">M</div>
          <div>
            <div class="font-bold text-gray-900">Meetflow</div>
            <div class="text-xs font-medium text-gray-400 uppercase tracking-wide">Admin</div>
          </div>
        </div>
      </div>

      <nav class="flex-1 p-3 flex flex-col gap-1">
        <button
          v-for="item in navItems"
          :key="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
          :class="isActive(item.to)
            ? 'bg-primary-50 text-primary-700 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          "
          @click="navigate(item.to)"
        >
          <i :class="item.icon" class="text-base"></i>
          {{ item.label }}
        </button>
      </nav>

      <div class="p-4 border-t border-gray-100">
        <div v-if="owner" class="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50">
          <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
            {{ owner.name.charAt(0) }}
          </div>
          <div class="min-w-0">
            <div class="text-sm font-medium text-gray-900 truncate">{{ owner.name }}</div>
            <div class="text-xs text-gray-400 truncate">{{ owner.email }}</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 min-w-0">
      <RouterView />
    </main>
  </div>
</template>
