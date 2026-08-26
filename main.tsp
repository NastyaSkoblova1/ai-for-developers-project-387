import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using Http;
using Rest;

@service(#{
  title: "Calendar Booking Service"
})
@server("http://localhost:3000", "Local development server")
namespace CalendarService;

// ============================================
// Domain Models
// ============================================

/** The single predefined calendar owner */
model Owner {
  id: string;
  name: string;
  email: string;
}

/** Event type created by the owner. Defines duration of each slot */
model EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: int32;
}

/** Input for creating a new event type */
model EventTypeInput {
  name: string;
  description: string;
  durationMinutes: int32;
}

/** Time slot generated for an event type within the booking window */
model Slot {
  id: string;
  eventTypeId: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
  isAvailable: boolean;
}

/** Guest booking on a specific slot */
model Booking {
  id: string;
  slotId: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  startTime: utcDateTime;
  endTime: utcDateTime;
  createdAt: utcDateTime;
}

/** Request body for creating a booking */
model CreateBookingRequest {
  slotId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
}

@error
model ApiError {
  code: int32;
  message: string;
}

model EventTypeList {
  items: EventType[];
}

model SlotList {
  items: Slot[];
}

model BookingList {
  items: Booking[];
}

// ============================================
// Public API — Guest scenarios
// ============================================

@route("/event-types")
@tag("Public — Event Types")
interface PublicEventTypes {
  /** List all available event types with name, description and duration */
  @get list(): EventTypeList | ApiError;
}

@route("/event-types/{id}/slots")
@tag("Public — Slots")
interface PublicSlots {
  /** List available slots for a specific event type for the next 14 days */
  @get list(@path id: string): SlotList | ApiError;
}

@route("/bookings")
@tag("Public — Bookings")
interface PublicBookings {
  /** Create a booking for a free slot.
   * Returns error if the slot is already booked or outside the 14-day window. */
  @post create(@body body: CreateBookingRequest): Booking | ApiError;
}

// ============================================
// Admin API — Owner scenarios
// ============================================

@route("/admin/owner")
@tag("Admin — Owner")
interface AdminOwner {
  /** Get the predefined calendar owner profile */
  @get get(): Owner | ApiError;
}

@route("/admin/event-types")
@tag("Admin — Event Types")
interface AdminEventTypes {
  /** List all event types */
  @get list(): EventTypeList | ApiError;

  /** Create a new event type */
  @post create(@body body: EventTypeInput): EventType | ApiError;
}

@route("/admin/event-types/{id}")
@tag("Admin — Event Types")
interface AdminEventTypeDetail {
  /** Get a specific event type */
  @get get(@path id: string): EventType | ApiError;

  /** Update an event type */
  @patch update(@path id: string, @body body: MergePatchUpdate<EventTypeInput>): EventType | ApiError;

  /** Delete an event type */
  @delete delete(@path id: string): void | ApiError;
}

@route("/admin/bookings")
@tag("Admin — Bookings")
interface AdminBookings {
  /** List all upcoming bookings across all event types */
  @get list(): BookingList | ApiError;
}
