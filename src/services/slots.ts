import { memoryStore } from "../storage/memory-store.js";
import type { Slot } from "../storage/memory-store.js";
import {
  WORKDAY_START_HOUR,
  WORKDAY_END_HOUR,
  SLOT_STEP_MINUTES,
  BOOKING_WINDOW_DAYS,
  startOfDayUtc,
  addDaysUtc,
  addMinutesUtc,
  isWeekendUtc,
  isoString,
} from "../lib/dates.js";

export function generateSlots(eventTypeId: string): Slot[] {
  const now = new Date();
  const slots: Slot[] = [];

  const eventType = memoryStore.eventTypes.find((et) => et.id === eventTypeId);
  if (!eventType) return [];

  for (let dayOffset = 0; dayOffset < BOOKING_WINDOW_DAYS; dayOffset++) {
    const day = addDaysUtc(startOfDayUtc(now), dayOffset);
    if (isWeekendUtc(day)) continue;

    const dayStartMinutes = WORKDAY_START_HOUR * 60;
    const dayEndMinutes = WORKDAY_END_HOUR * 60;
    const dayEnd = new Date(day);
    dayEnd.setUTCHours(WORKDAY_END_HOUR, 0, 0, 0);

    for (
      let minuteOfDay = dayStartMinutes;
      minuteOfDay < dayEndMinutes;
      minuteOfDay += SLOT_STEP_MINUTES
    ) {
      const slotStart = new Date(day);
      slotStart.setUTCHours(Math.floor(minuteOfDay / 60), minuteOfDay % 60, 0, 0);
      if (dayOffset === 0 && slotStart <= now) continue;

      const slotEnd = addMinutesUtc(slotStart, eventType.durationMinutes);
      if (slotEnd > dayEnd) continue;

      const slotId = `${eventTypeId}__${isoString(slotStart)}`;
      const isBooked = memoryStore.bookings.some(
        (b) => b.slotId === slotId || (b.startTime === isoString(slotStart) && b.eventTypeId === eventTypeId),
      );

      slots.push({
        id: slotId,
        eventTypeId,
        startTime: isoString(slotStart),
        endTime: isoString(slotEnd),
        isAvailable: !isBooked,
      });
    }
  }

  return slots.filter((s) => s.isAvailable);
}
