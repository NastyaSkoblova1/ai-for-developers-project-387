<script setup lang="ts">
import { computed } from 'vue'
import { useAdminBookingsQuery, useAdminEventTypesQuery } from '@/composables/useApi'
import { formatFullDateTime } from '@/utils/dates'

const { data: bookings, isLoading, isError, error } = useAdminBookingsQuery()
const { data: eventTypes } = useAdminEventTypesQuery()

const eventTypeMap = computed(() => {
  const map = new Map<string, string>()
  eventTypes.value?.forEach((et: { id: string; name: string }) => map.set(et.id, et.name))
  return map
})

const sortedBookings = computed(() => {
  if (!bookings.value) return []
  return [...bookings.value].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )
})

const now = new Date()
const upcomingCount = computed(() => sortedBookings.value.filter((b) => new Date(b.startTime) >= now).length)
const pastCount = computed(() => sortedBookings.value.filter((b) => new Date(b.startTime) < now).length)
</script>

<template>
  <div class="p-6 lg:p-8 max-w-6xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div class="page-header mb-0">
        <h1>Бронирования</h1>
        <p>Все записи на встречи</p>
      </div>
      <div class="flex gap-3 flex-shrink-0">
        <div class="badge badge-success">
          <i class="pi pi-clock" style="font-size: 0.625rem;"></i>
          Предстоящие: {{ upcomingCount }}
        </div>
        <div class="badge badge-gray">
          Прошедшие: {{ pastCount }}
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-2">
      <div v-for="i in 5" :key="i" class="skeleton h-16 rounded-lg"></div>
    </div>

    <!-- Error -->
    <div v-else-if="isError" class="error-state">
      <div class="error-state-title">
        <i class="pi pi-exclamation-circle"></i>
        Ошибка загрузки
      </div>
      <p class="text-sm">{{ error?.message || 'Не удалось загрузить бронирования' }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="!sortedBookings.length" class="empty-state">
      <div class="empty-state-icon">
        <i class="pi pi-calendar" style="font-size: 2.5rem;"></i>
      </div>
      <div class="empty-state-title">Нет бронирований</div>
      <div class="empty-state-desc">Пока никто не записался на встречу</div>
    </div>

    <!-- Table -->
    <div v-else class="table-container overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table-modern">
          <thead>
            <tr>
              <th>Гость</th>
              <th>Email</th>
              <th>Тип встречи</th>
              <th>Дата и время</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in sortedBookings" :key="booking.id">
              <td>
                <div class="font-semibold text-gray-900">{{ booking.guestName }}</div>
                <div v-if="booking.guestPhone" class="text-xs text-gray-400 mt-0.5">{{ booking.guestPhone }}</div>
              </td>
              <td class="text-gray-600">{{ booking.guestEmail }}</td>
              <td>
                <span class="badge badge-primary">
                  {{ eventTypeMap.get(booking.eventTypeId) || '—' }}
                </span>
              </td>
              <td class="whitespace-nowrap font-medium text-gray-700">
                {{ formatFullDateTime(booking.startTime) }}
              </td>
              <td>
                <span
                  class="badge"
                  :class="new Date(booking.startTime) >= now
                    ? 'badge-success'
                    : 'badge-gray'
                  "
                >
                  {{ new Date(booking.startTime) >= now ? 'Предстоящее' : 'Прошедшее' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
