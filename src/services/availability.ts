import { memoryStore } from "../storage/memory-store.js";
import type { Booking } from "../storage/memory-store.js";

export function findConflictingBooking(
  slotId: string,
  startTime: string,
  endTime: string,
): Booking | undefined {
  return memoryStore.bookings.find(
    (b) => b.slotId === slotId || (b.startTime < endTime && b.endTime > startTime),
  );
}
