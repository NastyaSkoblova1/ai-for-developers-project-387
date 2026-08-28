import { memoryStore } from "../storage/memory-store.js";
import { conflict, notFound, badRequest } from "../lib/errors.js";
import type { Booking } from "../storage/memory-store.js";
import { generateSlots } from "./slots.js";
import { isoString } from "../lib/dates.js";

export function listBookings(): Booking[] {
  return memoryStore.bookings;
}

export function createBooking(data: {
  slotId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
}): Booking {
  const { slotId, guestName, guestEmail, guestPhone } = data;

  const parts = slotId.split("__");
  if (parts.length < 2) {
    throw badRequest("Invalid slotId format");
  }
  const eventTypeId = parts[0];

  const eventType = memoryStore.eventTypes.find((et) => et.id === eventTypeId);
  if (!eventType) {
    throw notFound(`Event type not found for slot "${slotId}"`);
  }

  const availableSlots = generateSlots(eventTypeId);
  const slot = availableSlots.find((s) => s.id === slotId);
  if (!slot) {
    throw conflict("Selected slot is no longer available");
  }

  const alreadyBooked = memoryStore.bookings.some(
    (b) => b.slotId === slotId || (b.startTime < slot.endTime && b.endTime > slot.startTime),
  );
  if (alreadyBooked) {
    throw conflict("Selected slot is no longer available");
  }

  const booking: Booking = {
    id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    slotId,
    eventTypeId,
    guestName,
    guestEmail,
    guestPhone,
    startTime: slot.startTime,
    endTime: slot.endTime,
    createdAt: isoString(new Date()),
  };

  memoryStore.bookings.push(booking);
  return booking;
}
