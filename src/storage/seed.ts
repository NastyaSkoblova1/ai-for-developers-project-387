import { memoryStore } from "./memory-store.js";

export function seedData(): void {
  memoryStore.owner = {
    id: "owner-1",
    name: "Alice Johnson",
    email: "alice@example.com",
  };

  memoryStore.eventTypes = [
    {
      id: "et-1",
      name: "Quick Call",
      description: "A short 15-minute intro call.",
      durationMinutes: 15,
    },
    {
      id: "et-2",
      name: "Deep Dive",
      description: "A detailed 45-minute discussion.",
      durationMinutes: 45,
    },
    {
      id: "et-3",
      name: "Workshop",
      description: "A full 90-minute collaborative session.",
      durationMinutes: 90,
    },
  ];

  memoryStore.bookings = [];
}
