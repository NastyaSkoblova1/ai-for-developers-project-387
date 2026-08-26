import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  getPublicEventTypes,
  getPublicSlots,
  createBooking,
  getOwner,
  getAdminEventTypes,
  createEventType,
  getAdminEventType,
  updateEventType,
  deleteEventType,
  getAdminBookings,
} from '@/api/index'
import type { CreateBookingRequest, EventTypeInput, EventTypeInputMergePatchUpdate, Owner, EventType, Booking, Slot } from '@/generated/types.gen'

// Query Keys
export const queryKeys = {
  owner: ['owner'],
  eventTypes: ['event-types'],
  eventType: (id: string) => ['event-types', id],
  slots: (eventTypeId: string) => ['slots', eventTypeId],
  bookings: ['bookings'],
}

// Public queries
export function usePublicEventTypesQuery() {
  return useQuery<EventType[], Error>({
    queryKey: queryKeys.eventTypes,
    queryFn: async () => {
      const res = await getPublicEventTypes()
      return res.data?.items ?? []
    },
  })
}

export function usePublicSlotsQuery(eventTypeId: string) {
  return useQuery<Slot[], Error>({
    queryKey: queryKeys.slots(eventTypeId),
    queryFn: async () => {
      const res = await getPublicSlots(eventTypeId)
      return res.data?.items ?? []
    },
    enabled: !!eventTypeId,
  })
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient()
  return useMutation<Booking, Error, CreateBookingRequest>({
    mutationFn: async (body) => {
      const res = await createBooking(body)
      if (!res.data) throw new Error('Не удалось создать бронирование')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings })
      queryClient.invalidateQueries({ queryKey: ['slots'] })
    },
  })
}

// Admin queries
export function useOwnerQuery() {
  return useQuery<Owner, Error>({
    queryKey: queryKeys.owner,
    queryFn: async () => {
      const res = await getOwner()
      if (!res.data) throw new Error('Не удалось загрузить профиль')
      return res.data
    },
  })
}

export function useAdminEventTypesQuery() {
  return useQuery<EventType[], Error>({
    queryKey: queryKeys.eventTypes,
    queryFn: async () => {
      const res = await getAdminEventTypes()
      return res.data?.items ?? []
    },
  })
}

export function useAdminEventTypeQuery(id: string) {
  return useQuery<EventType, Error>({
    queryKey: queryKeys.eventType(id),
    queryFn: async () => {
      const res = await getAdminEventType(id)
      if (!res.data) throw new Error('Не удалось загрузить тип встречи')
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateEventTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation<EventType, Error, EventTypeInput>({
    mutationFn: async (body) => {
      const res = await createEventType(body)
      if (!res.data) throw new Error('Не удалось создать тип встречи')
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.eventTypes })
    },
  })
}

export function useUpdateEventTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation<EventType, Error, { id: string; body: EventTypeInputMergePatchUpdate }>({
    mutationFn: async ({ id, body }) => {
      const res = await updateEventType(id, body)
      if (!res.data) throw new Error('Не удалось обновить тип встречи')
      return res.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.eventType(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.eventTypes })
    },
  })
}

export function useDeleteEventTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await deleteEventType(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.eventTypes })
    },
  })
}

export function useAdminBookingsQuery() {
  return useQuery<Booking[], Error>({
    queryKey: queryKeys.bookings,
    queryFn: async () => {
      const res = await getAdminBookings()
      return res.data?.items ?? []
    },
  })
}
