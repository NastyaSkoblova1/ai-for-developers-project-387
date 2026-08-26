import { format, parseISO, isSameDay, isBefore, startOfToday } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Slot } from '@/generated/types.gen'

export function formatSlotTime(isoString: string): string {
  return format(parseISO(isoString), 'HH:mm')
}

export function formatSlotDate(isoString: string): string {
  return format(parseISO(isoString), 'EEEE, d MMMM', { locale: ru })
}

export function formatShortDate(isoString: string): string {
  return format(parseISO(isoString), 'd MMM', { locale: ru })
}

export function formatFullDateTime(isoString: string): string {
  return format(parseISO(isoString), 'd MMMM yyyy, HH:mm', { locale: ru })
}

export function filterSlotsByDate(slots: Slot[], date: Date): Slot[] {
  return slots.filter((s) => isSameDay(parseISO(s.startTime), date))
}

export function getAvailableDates(slots: Slot[]): Date[] {
  const dates = new Map<string, Date>()
  for (const slot of slots) {
    if (slot.isAvailable) {
      const d = parseISO(slot.startTime)
      const key = format(d, 'yyyy-MM-dd')
      dates.set(key, d)
    }
  }
  return Array.from(dates.values()).sort((a, b) => a.getTime() - b.getTime())
}

export function isSlotInPast(startTime: string): boolean {
  return isBefore(parseISO(startTime), startOfToday())
}
