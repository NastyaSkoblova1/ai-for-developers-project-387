import {
  publicEventTypesList,
  publicSlotsList,
  publicBookingsCreate,
  adminOwnerGet,
  adminEventTypesList,
  adminEventTypesCreate,
  adminEventTypeDetailGet,
  adminEventTypeDetailUpdate,
  adminEventTypeDetailDelete,
  adminBookingsList,
} from '@/generated/sdk.gen'
import type {
  EventTypeInput,
  EventTypeInputMergePatchUpdate,
  CreateBookingRequest,
} from '@/generated/types.gen'
import { apiClient } from './client'

// Public API
export const getPublicEventTypes = () => publicEventTypesList({ client: apiClient })
export const getPublicSlots = (id: string) => publicSlotsList({ client: apiClient, path: { id } })
export const createBooking = (body: CreateBookingRequest) => publicBookingsCreate({ client: apiClient, body })

// Admin API
export const getOwner = () => adminOwnerGet({ client: apiClient })
export const getAdminEventTypes = () => adminEventTypesList({ client: apiClient })
export const createEventType = (body: EventTypeInput) => adminEventTypesCreate({ client: apiClient, body })
export const getAdminEventType = (id: string) => adminEventTypeDetailGet({ client: apiClient, path: { id } })
export const updateEventType = (id: string, body: EventTypeInputMergePatchUpdate) =>
  adminEventTypeDetailUpdate({ client: apiClient, path: { id }, body })
export const deleteEventType = (id: string) => adminEventTypeDetailDelete({ client: apiClient, path: { id } })
export const getAdminBookings = () => adminBookingsList({ client: apiClient })
