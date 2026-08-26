<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePublicEventTypesQuery, usePublicSlotsQuery, useCreateBookingMutation } from '@/composables/useApi'
import { formatSlotTime, formatSlotDate, filterSlotsByDate, isSlotInPast } from '@/utils/dates'
import { getErrorMessage } from '@/utils/errors'
import { z } from 'zod'
import { useToast } from 'primevue/usetoast'
import Calendar from 'primevue/calendar'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const eventTypeId = computed(() => route.params.eventTypeId as string)

const { data: eventTypes } = usePublicEventTypesQuery()
const eventType = computed(() => eventTypes.value?.find((et: { id: string }) => et.id === eventTypeId.value))

const { data: allSlots, isLoading: slotsLoading, isError: slotsError } = usePublicSlotsQuery(eventTypeId.value)

const selectedDate = ref<Date>(new Date(Date.now() + 24 * 60 * 60 * 1000))
const selectedSlotId = ref<string | null>(null)
const showForm = ref(false)
const isSubmitting = ref(false)
const bookingSuccess = ref(false)
const createdBooking = ref<{
  id: string
  guestName: string
  guestEmail: string
  startTime: string
  endTime: string
} | null>(null)

const guestName = ref('')
const guestEmail = ref('')
const guestPhone = ref('')
const formErrors = ref<Record<string, string>>({})

const bookingSchema = z.object({
  guestName: z.string().min(1, 'Введите имя'),
  guestEmail: z.string().email('Введите корректный email'),
  guestPhone: z.string().optional(),
})

const slotsForDate = computed(() => {
  if (!allSlots.value) return []
  return filterSlotsByDate(allSlots.value, selectedDate.value).filter(
    (s) => s.isAvailable && !isSlotInPast(s.startTime)
  )
})

const hasSlotsForDate = computed(() => slotsForDate.value.length > 0)

watch(eventTypeId, (newId) => {
  if (!newId) return
  selectedDate.value = new Date()
  selectedSlotId.value = null
  showForm.value = false
  bookingSuccess.value = false
  createdBooking.value = null
  guestName.value = ''
  guestEmail.value = ''
  guestPhone.value = ''
  formErrors.value = {}
})

function selectSlot(slotId: string) {
  selectedSlotId.value = slotId
  showForm.value = true
  formErrors.value = {}
}

function goBack() {
  router.push({ name: 'home' })
}

function validateForm(): boolean {
  const result = bookingSchema.safeParse({
    guestName: guestName.value,
    guestEmail: guestEmail.value,
    guestPhone: guestPhone.value || undefined,
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

const createBooking = useCreateBookingMutation()

async function submitBooking() {
  if (!selectedSlotId.value) return
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const booking = await createBooking.mutateAsync({
      slotId: selectedSlotId.value,
      guestName: guestName.value,
      guestEmail: guestEmail.value,
      guestPhone: guestPhone.value || undefined,
    })

    bookingSuccess.value = true
    createdBooking.value = booking
    toast.add({
      severity: 'success',
      summary: 'Бронирование создано',
      detail: 'Встреча успешно запланирована',
      life: 4000,
    })
  } catch (err) {
    const msg = getErrorMessage(err)
    toast.add({
      severity: 'error',
      summary: 'Ошибка бронирования',
      detail: msg,
      life: 6000,
    })
  } finally {
    isSubmitting.value = false
  }
}

function resetBooking() {
  bookingSuccess.value = false
  selectedSlotId.value = null
  showForm.value = false
  guestName.value = ''
  guestEmail.value = ''
  guestPhone.value = ''
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <button
      class="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors mb-8"
      @click="goBack"
    >
      <i class="pi pi-arrow-left text-xs"></i>
      <span>Вернуться к списку встреч</span>
    </button>

    <!-- Loading Event Type -->
    <div v-if="!eventType" class="card p-8">
      <div class="skeleton h-8 w-1/3 mb-3"></div>
      <div class="skeleton h-4 w-2/3"></div>
    </div>

    <!-- Event Type Info -->
    <div v-else class="mb-8">
      <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">{{ eventType.name }}</h1>
      <p class="text-gray-500 text-lg leading-relaxed">{{ eventType.description }}</p>
      <div class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-700 bg-primary-50 px-3 py-1.5 rounded-full">
        <i class="pi pi-clock"></i>
        <span>{{ eventType.durationMinutes }} минут</span>
      </div>
    </div>

    <!-- Success State -->
    <div v-if="bookingSuccess && createdBooking" class="booking-container p-8 text-center animate-scale-in" data-testid="booking-success">
      <div class="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-6 shadow-sm">
        <i class="pi pi-check text-3xl text-success-500"></i>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Встреча запланирована!</h2>
      <p class="text-gray-500 mb-8 max-w-md mx-auto">
        Подтверждение отправлено на <strong class="text-gray-700">{{ createdBooking.guestEmail }}</strong>
      </p>

      <div class="max-w-sm mx-auto card p-5 text-left mb-8">
        <div class="mb-4 pb-4 border-b border-gray-100">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Дата и время</div>
          <div class="font-semibold text-gray-900">{{ formatSlotDate(createdBooking.startTime) }}</div>
          <div class="text-primary-600 font-bold mt-1">{{ formatSlotTime(createdBooking.startTime) }} — {{ formatSlotTime(createdBooking.endTime) }}</div>
        </div>
        <div class="mb-4 pb-4 border-b border-gray-100">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Гость</div>
          <div class="font-semibold text-gray-900">{{ createdBooking.guestName }}</div>
        </div>
        <div>
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">ID бронирования</div>
          <div class="font-mono text-sm text-gray-500">{{ createdBooking.id }}</div>
        </div>
      </div>

      <div class="flex gap-3 justify-center">
        <button class="btn btn-primary" @click="resetBooking">
          Забронировать ещё
        </button>
        <button class="btn btn-secondary" @click="goBack">
          На главную
        </button>
      </div>
    </div>

    <!-- Booking Flow -->
    <div v-else-if="eventType" class="booking-container">
      <div class="flex flex-col lg:flex-row">
        <!-- Calendar + Slots -->
        <div class="flex-1 p-6 lg:p-8 lg:border-r border-gray-200">
          <h2 class="font-bold text-lg text-gray-900 mb-6">Выберите дату и время</h2>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-600 mb-2">Дата</label>
            <Calendar
              v-model="selectedDate"
              :minDate="new Date()"
              dateFormat="dd.mm.yy"
              showIcon
              iconDisplay="input"
              class="w-full"
              inputClass="input-modern"
              panelClass="rounded-xl shadow-lg"
              data-testid="calendar-picker"
            />
          </div>

          <!-- Slots -->
          <div v-if="slotsLoading" class="grid grid-cols-3 sm:grid-cols-4 gap-2">
            <div v-for="i in 8" :key="i" class="skeleton h-11 rounded-lg"></div>
          </div>

          <div v-else-if="slotsError" class="error-state text-sm">
            Не удалось загрузить слоты. Попробуйте обновить страницу.
          </div>

          <div v-else-if="!hasSlotsForDate" class="empty-state py-10">
            <div class="empty-state-icon">
              <i class="pi pi-calendar-times" style="font-size: 2rem;"></i>
            </div>
            <div class="empty-state-title">Нет доступного времени</div>
            <div class="empty-state-desc">Выберите другую дату</div>
          </div>

          <div v-else class="grid grid-cols-3 sm:grid-cols-4 gap-2">
            <button
              v-for="slot in slotsForDate"
              :key="slot.id"
              class="time-slot-btn"
              :class="{ selected: selectedSlotId === slot.id }"
              :data-testid="`slot-button-${slot.id}`"
              @click="selectSlot(slot.id)"
            >
              {{ formatSlotTime(slot.startTime) }}
            </button>
          </div>
        </div>

        <!-- Guest Form -->
        <div class="w-full lg:w-96 p-6 lg:p-8 bg-gray-50">
          <h2 class="font-bold text-lg text-gray-900 mb-5">Ваши данные</h2>

          <div v-if="!showForm" class="text-sm text-gray-500 leading-relaxed">
            Выберите время слева, чтобы продолжить оформление бронирования.
          </div>

          <form v-else class="flex flex-col gap-4 animate-fade-in" @submit.prevent="submitBooking">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5" for="guest-name">
                Имя <span class="text-error-500">*</span>
              </label>
              <input
                id="guest-name"
                v-model="guestName"
                type="text"
                placeholder="Ваше имя"
                class="input-modern"
                :class="{ 'input-error': formErrors.guestName }"
                data-testid="guest-name-input"
              />
              <p v-if="formErrors.guestName" class="text-xs text-error-500 mt-1.5 font-medium">{{ formErrors.guestName }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5" for="guest-email">
                Email <span class="text-error-500">*</span>
              </label>
              <input
                id="guest-email"
                v-model="guestEmail"
                type="email"
                placeholder="you@example.com"
                class="input-modern"
                :class="{ 'input-error': formErrors.guestEmail }"
                data-testid="guest-email-input"
              />
              <p v-if="formErrors.guestEmail" class="text-xs text-error-500 mt-1.5 font-medium">{{ formErrors.guestEmail }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5" for="guest-phone">Телефон</label>
              <input
                id="guest-phone"
                v-model="guestPhone"
                type="tel"
                placeholder="+7 (999) 000-00-00"
                class="input-modern"
                data-testid="guest-phone-input"
              />
            </div>

            <div class="pt-2">
              <button
                type="submit"
                class="btn btn-primary w-full"
                :disabled="isSubmitting"
                data-testid="submit-booking-button"
              >
                <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                  <i class="pi pi-spinner pi-spin"></i>
                  Создание...
                </span>
                <span v-else>Подтвердить бронирование</span>
              </button>
            </div>

            <div v-if="selectedSlotId && slotsForDate.length" class="text-xs text-gray-400 pt-1">
              Выбрано: {{ formatSlotDate(slotsForDate.find((s: { id: string }) => s.id === selectedSlotId)?.startTime || '') }} в {{ formatSlotTime(slotsForDate.find((s: { id: string }) => s.id === selectedSlotId)?.startTime || '') }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
