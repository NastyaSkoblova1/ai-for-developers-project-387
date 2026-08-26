import { memoryStore } from "../storage/memory-store.js";
import { notFound } from "../lib/errors.js";
import type { EventType } from "../storage/memory-store.js";

export function listEventTypes(): EventType[] {
  return memoryStore.eventTypes;
}

export function getEventType(id: string): EventType {
  const et = memoryStore.eventTypes.find((e) => e.id === id);
  if (!et) throw notFound(`Event type with id "${id}" not found`);
  return et;
}

export function createEventType(data: {
  name: string;
  description: string;
  durationMinutes: number;
}): EventType {
  const et: EventType = {
    id: `et-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: data.name,
    description: data.description,
    durationMinutes: data.durationMinutes,
  };
  memoryStore.eventTypes.push(et);
  return et;
}

export function updateEventType(
  id: string,
  data: Partial<{ name: string; description: string; durationMinutes: number }>,
): EventType {
  const et = getEventType(id);
  if (data.name !== undefined) et.name = data.name;
  if (data.description !== undefined) et.description = data.description;
  if (data.durationMinutes !== undefined) et.durationMinutes = data.durationMinutes;
  return et;
}

export function deleteEventType(id: string): void {
  const idx = memoryStore.eventTypes.findIndex((e) => e.id === id);
  if (idx === -1) throw notFound(`Event type with id "${id}" not found`);
  memoryStore.eventTypes.splice(idx, 1);
}
