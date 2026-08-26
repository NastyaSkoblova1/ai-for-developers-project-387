export interface Owner {
  id: string;
  name: string;
  email: string;
}

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface Booking {
  id: string;
  slotId: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface Slot {
  id: string;
  eventTypeId: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export const memoryStore = {
  owner: null as Owner | null,
  eventTypes: [] as EventType[],
  bookings: [] as Booking[],
};
