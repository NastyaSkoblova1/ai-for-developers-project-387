<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminEventTypeQuery, useCreateEventTypeMutation, useUpdateEventTypeMutation } from '@/composables/useApi'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const isEdit = computed(() => !!route.params.id)
const eventTypeId = computed(() => route.params.id as string)

const { data: existingEventType, isLoading: loadExisting } = useAdminEventTypeQuery(eventTypeId.value)

const name = ref('')
const description = ref('')
const durationMinutes = ref<number>(30)
const formErrors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

const eventTypeSchema = z.object({
  name: z.string().min(1, 'Введите название'),
  description: z.string().min(1, 'Введите описание'),
  durationMinutes: z.number().min(5, 'Минимум 5 минут').max(480, 'Максимум 8 часов'),
})

watch(existingEventType, (et) => {
  if (et) {
    name.value = et.name
    description.value = et.description
    durationMinutes.value = et.durationMinutes
  }
})

function validateForm(): boolean {
  const result = eventTypeSchema.safeParse({
    name: name.value,
    description: description.value,
    durationMinutes: Number(durationMinutes.value),
  })

  if (!result.success) {
    formErrors.value = {}
    for (const issue of result.error.issues) {
      const key = issue.path[0] as string
      formErrors.value[key] = issue.message
    }
    return false
  }

  formErrors.value = {}
  return true
}

const createMutation = useCreateEventTypeMutation()
const updateMutation = useUpdateEventTypeMutation()

async function submitForm() {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    if (isEdit.value) {
      await updateMutation.mutateAsync({
        id: eventTypeId.value,
        body: { name: name.value, description: description.value, durationMinutes: Number(durationMinutes.value) },
      })
      toast.add({ severity: 'success', summary: 'Сохранено', detail: 'Тип встречи обновлён', life: 3000 })
    } else {
      await createMutation.mutateAsync({
        name: name.value,
        description: description.value,
        durationMinutes: Number(durationMinutes.value),
      })
      toast.add({ severity: 'success', summary: 'Создано', detail: 'Новый тип встречи создан', life: 3000 })
    }
    router.push({ name: 'admin-event-types' })
  } catch {
    toast.add({ severity: 'error', summary: 'Ошибка', detail: isEdit.value ? 'Не удалось обновить' : 'Не удалось создать', life: 4000 })
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  router.push({ name: 'admin-event-types' })
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-xl mx-auto">
    <button
      class="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors mb-8"
      @click="goBack"
    >
      <i class="pi pi-arrow-left text-xs"></i>
      <span>К списку типов встреч</span>
    </button>

    <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
      {{ isEdit ? 'Редактировать тип встречи' : 'Создать тип встречи' }}
    </h1>

    <div v-if="isEdit && loadExisting" class="space-y-4">
      <div class="skeleton h-11 rounded-lg"></div>
      <div class="skeleton h-20 rounded-lg"></div>
      <div class="skeleton h-11 rounded-lg"></div>
    </div>

    <form v-else class="card p-6 lg:p-8 flex flex-col gap-5 animate-fade-in" @submit.prevent="submitForm">
      <div>
        <label class="block text-sm font-semibold text-gray-800 mb-2">
          Название <span class="text-error-500">*</span>
        </label>
        <input
          v-model="name"
          type="text"
          placeholder="Например, Консультация"
          class="input-modern"
          :class="{ 'input-error': formErrors.name }"
        />
        <p v-if="formErrors.name" class="text-xs text-error-500 mt-1.5 font-medium">{{ formErrors.name }}</p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-800 mb-2">
          Описание <span class="text-error-500">*</span>
        </label>
        <textarea
          v-model="description"
          rows="3"
          placeholder="Опишите, что включает встреча"
          class="input-modern resize-none"
          :class="{ 'input-error': formErrors.description }"
        ></textarea>
        <p v-if="formErrors.description" class="text-xs text-error-500 mt-1.5 font-medium">{{ formErrors.description }}</p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-800 mb-2">
          Длительность (минуты) <span class="text-error-500">*</span>
        </label>
        <input
          v-model.number="durationMinutes"
          type="number"
          min="5"
          max="480"
          placeholder="30"
          class="input-modern"
          :class="{ 'input-error': formErrors.durationMinutes }"
        />
        <p v-if="formErrors.durationMinutes" class="text-xs text-error-500 mt-1.5 font-medium">{{ formErrors.durationMinutes }}</p>
      </div>

      <div class="flex gap-3 pt-2">
        <button
          type="submit"
          class="btn btn-primary flex-1"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
            <i class="pi pi-spinner pi-spin"></i>
            Сохранение...
          </span>
          <span v-else>{{ isEdit ? 'Сохранить изменения' : 'Создать' }}</span>
        </button>
        <button type="button" class="btn btn-secondary" @click="goBack">
          Отмена
        </button>
      </div>
    </form>
  </div>
</template>
