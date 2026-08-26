<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOwnerQuery, useAdminEventTypesQuery, useAdminBookingsQuery } from '@/composables/useApi'
import { formatFullDateTime } from '@/utils/dates'

const router = useRouter()

const { data: owner, isLoading: ownerLoading } = useOwnerQuery()
const { data: eventTypes, isLoading: etLoading } = useAdminEventTypesQuery()
const { data: bookings, isLoading: bookingsLoading } = useAdminBookingsQuery()

const upcomingBookings = computed(() => {
  if (!bookings.value) return []
  const now = new Date()
  return bookings.value
    .filter((b: { startTime: string }) => new Date(b.startTime) >= now)
    .sort((a: { startTime: string }, b: { startTime: string }) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5)
})

const stats = computed(() => [
  { label: 'Типы встреч', value: eventTypes.value?.length ?? 0, icon: 'pi pi-calendar-plus', color: 'primary' },
  { label: 'Всего бронирований', value: bookings.value?.length ?? 0, icon: 'pi pi-calendar', color: 'gray' },
  { label: 'Предстоящие', value: upcomingBookings.value.length, icon: 'pi pi-clock', color: 'success' },
])
</script>

<template>
  <div class="p-6 lg:p-8 max-w-6xl mx-auto">
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Обзор вашего календаря</p>
    </div>

    <!-- Owner Card -->
    <div class="card p-5 mb-6 flex items-center gap-4 animate-fade-in">
      <div v-if="ownerLoading" class="skeleton w-14 h-14 rounded-full"></div>
      <template v-else-if="owner">
        <div class="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl flex-shrink-0">
          {{ owner.name.charAt(0) }}
        </div>
        <div>
          <div class="font-bold text-lg text-gray-900">{{ owner.name }}</div>
          <div class="text-sm text-gray-500">{{ owner.email }}</div>
        </div>
      </template>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="card p-5 animate-fade-in"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-gray-500">{{ stat.label }}</span>
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="`bg-${stat.color}-50 text-${stat.color}-500`">
            <i :class="stat.icon" class="text-lg"></i>
          </div>
        </div>
        <div v-if="etLoading || bookingsLoading" class="skeleton h-8 w-16"></div>
        <div v-else class="text-3xl font-extrabold text-gray-900 tracking-tight">{{ stat.value }}</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="flex flex-wrap gap-3 mb-10">
      <button class="btn btn-primary" @click="router.push({ name: 'admin-event-type-new' })">
        <i class="pi pi-plus"></i>
        Создать тип встречи
      </button>
      <button class="btn btn-secondary" @click="router.push({ name: 'admin-bookings' })">
        <i class="pi pi-list"></i>
        Все бронирования
      </button>
    </div>

    <!-- Upcoming Bookings -->
    <div class="card p-6 animate-fade-in">
      <h2 class="font-bold text-lg text-gray-900 mb-5">Ближайшие бронирования</h2>

      <div v-if="bookingsLoading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="skeleton h-16 rounded-lg"></div>
      </div>

      <div v-else-if="!upcomingBookings.length" class="empty-state py-8">
        <div class="empty-state-icon">
          <i class="pi pi-calendar" style="font-size: 2rem;"></i>
        </div>
        <div class="empty-state-title">Нет предстоящих бронирований</div>
        <div class="empty-state-desc">Пока никто не записался на встречу</div>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="booking in upcomingBookings"
          :key="booking.id"
          class="py-4 flex items-center justify-between"
        >
          <div class="min-w-0 flex-1 mr-4">
            <div class="font-semibold text-gray-900 truncate">{{ booking.guestName }}</div>
            <div class="text-sm text-gray-500 mt-0.5">{{ formatFullDateTime(booking.startTime) }}</div>
          </div>
          <span class="badge badge-success flex-shrink-0">
            <i class="pi pi-check-circle" style="font-size: 0.625rem;"></i>
            Подтверждено
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
