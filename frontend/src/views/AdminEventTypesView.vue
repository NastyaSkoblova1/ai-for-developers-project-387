<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAdminEventTypesQuery, useDeleteEventTypeMutation } from '@/composables/useApi'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

const router = useRouter()
const confirm = useConfirm()
const toast = useToast()

const { data: eventTypes, isLoading, isError, error } = useAdminEventTypesQuery()
const deleteMutation = useDeleteEventTypeMutation()

function goNew() {
  router.push({ name: 'admin-event-type-new' })
}

function goEdit(id: string) {
  router.push({ name: 'admin-event-type-edit', params: { id } })
}

function confirmDelete(eventType: { id: string; name: string }) {
  confirm.require({
    message: `Удалить «${eventType.name}»? Это действие необратимо.`,
    header: 'Подтверждение',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Отмена',
    acceptLabel: 'Удалить',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteMutation.mutateAsync(eventType.id)
        toast.add({ severity: 'success', summary: 'Удалено', detail: `«${eventType.name}» удалён`, life: 3000 })
      } catch {
        toast.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить', life: 4000 })
      }
    },
  })
}

function copyLink(id: string) {
  const url = `${window.location.origin}/book/${id}`
  navigator.clipboard.writeText(url)
  toast.add({ severity: 'success', summary: 'Ссылка скопирована', detail: 'Скопировано в буфер обмена', life: 2500 })
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-6xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div class="page-header mb-0">
        <h1>Типы встреч</h1>
        <p>Управление доступными форматами</p>
      </div>
      <button class="btn btn-primary flex-shrink-0" @click="goNew">
        <i class="pi pi-plus"></i>
        Создать
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="card p-6">
        <div class="skeleton h-6 w-1/3 mb-3"></div>
        <div class="skeleton h-4 w-2/3"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="isError" class="error-state">
      <div class="error-state-title">
        <i class="pi pi-exclamation-circle"></i>
        Ошибка загрузки
      </div>
      <p class="text-sm">{{ error?.message || 'Не удалось загрузить' }}</p>
    </div>

    <!-- Empty -->
    <div v-else-if="!eventTypes?.length" class="empty-state">
      <div class="empty-state-icon">
        <i class="pi pi-calendar-plus" style="font-size: 2.5rem;"></i>
      </div>
      <div class="empty-state-title">Нет типов встреч</div>
      <div class="empty-state-desc">Создайте первый тип, чтобы начать принимать бронирования</div>
      <button class="btn btn-primary mt-6" @click="goNew">
        <i class="pi pi-plus"></i>
        Создать тип встречи
      </button>
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <div
        v-for="et in eventTypes"
        :key="et.id"
        class="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 mb-1.5">
            <h3 class="font-bold text-base text-gray-900 truncate">{{ et.name }}</h3>
            <span class="badge badge-primary">{{ et.durationMinutes }} мин</span>
          </div>
          <p class="text-sm text-gray-500 truncate">{{ et.description }}</p>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            class="btn btn-ghost btn-sm"
            title="Копировать ссылку"
            @click="copyLink(et.id)"
          >
            <i class="pi pi-link text-sm"></i>
          </button>
          <button
            class="btn btn-ghost btn-sm"
            title="Редактировать"
            @click="goEdit(et.id)"
          >
            <i class="pi pi-pencil text-sm"></i>
          </button>
          <button
            class="btn btn-ghost btn-sm text-error-500 hover:bg-error-50 hover:text-error-600"
            title="Удалить"
            @click="confirmDelete(et)"
          >
            <i class="pi pi-trash text-sm"></i>
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog />
  </div>
</template>
