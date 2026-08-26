<script setup lang="ts">
import { usePublicEventTypesQuery } from '@/composables/useApi'
import { useRouter } from 'vue-router'

const router = useRouter()
const { data: eventTypes, isLoading, isError, error } = usePublicEventTypesQuery()

function openBooking(id: string) {
  router.push({ name: 'booking', params: { eventTypeId: id } })
}
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
        Выберите тип встречи
      </h1>
      <p class="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
        Забронируйте удобное время за несколько кликов
      </p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 3" :key="i" class="card p-6">
        <div class="skeleton h-6 w-2/3 mb-4"></div>
        <div class="skeleton h-4 w-full mb-2"></div>
        <div class="skeleton h-4 w-1/2"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="isError" class="max-w-md mx-auto">
      <div class="error-state text-center">
        <div class="error-state-title justify-center mb-3">
          <i class="pi pi-exclamation-circle text-xl"></i>
          Ошибка загрузки
        </div>
        <p class="text-sm mb-4">{{ error?.message || 'Не удалось загрузить типы встреч' }}</p>
        <button class="btn btn-primary btn-sm" @click="$router.go(0)">
          <i class="pi pi-refresh"></i>
          Попробовать снова
        </button>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!eventTypes?.length" class="empty-state">
      <div class="empty-state-icon">
        <i class="pi pi-calendar-plus" style="font-size: 2.5rem;"></i>
      </div>
      <div class="empty-state-title">Нет доступных встреч</div>
      <div class="empty-state-desc">
        Владелец ещё не создал ни одного типа встречи. Загляните позже или войдите в админку, чтобы создать первую.
      </div>
      <RouterLink to="/admin/event-types/new" class="btn btn-primary mt-6 inline-flex">
        <i class="pi pi-plus"></i>
        Создать тип встречи
      </RouterLink>
    </div>

    <!-- List -->
    <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="et in eventTypes"
        :key="et.id"
        class="card card-interactive p-6"
        :data-testid="`event-type-card-${et.id}`"
        @click="openBooking(et.id)"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1 min-w-0 mr-3">
            <h3 class="font-bold text-lg text-gray-900 truncate">{{ et.name }}</h3>
          </div>
          <span class="badge badge-primary flex-shrink-0">
            {{ et.durationMinutes }} мин
          </span>
        </div>
        <p class="text-sm text-gray-500 leading-relaxed mb-5 min-h-[2.5rem]">{{ et.description }}</p>
        <div class="flex items-center gap-2 text-primary-600 text-sm font-semibold">
          <span>Забронировать</span>
          <i class="pi pi-arrow-right text-xs"></i>
        </div>
      </div>
    </div>
  </div>
</template>
