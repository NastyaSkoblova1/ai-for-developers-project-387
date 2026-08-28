import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { memoryStore } from "../../src/storage/memory-store.js";
import { seedData } from "../../src/storage/seed.js";
import { generateSlots } from "../../src/services/slots.js";
import { createBooking } from "../../src/services/bookings.js";

beforeEach(() => {
  seedData();
});

test("booking removes the booked same-type slot from available slots", () => {
  const before = generateSlots("et-1");
  assert.ok(before.length > 0);

  const target = before[0];
  createBooking({ slotId: target.id, guestName: "Alice", guestEmail: "alice@example.com" });

  const after = generateSlots("et-1");
  assert.ok(after.every((s) => s.id !== target.id));
});

test("booking hides overlapping slots of other event types", () => {
  const et1Slots = generateSlots("et-1");
  assert.ok(et1Slots.length > 0);

  const target = et1Slots[0];
  const start = target.startTime;
  const end = target.endTime;

  createBooking({ slotId: target.id, guestName: "Alice", guestEmail: "alice@example.com" });

  const et2Slots = generateSlots("et-2");
  const conflicting = et2Slots.filter((s) => s.startTime < end && s.endTime > start);
  assert.equal(conflicting.length, 0);
});

test("adjacent non-overlapping slot stays available", () => {
  const before = generateSlots("et-1");
  assert.ok(before.length > 0);

  const target = before[0];
  const adjacent = before.find((s) => s.startTime >= target.endTime);
  if (!adjacent) return;

  createBooking({ slotId: target.id, guestName: "Alice", guestEmail: "alice@example.com" });

  const after = generateSlots("et-1");
  assert.ok(after.some((s) => s.id === adjacent.id));
});

test("createBooking rejects a cross-type overlapping slot", () => {
  const et1Slots = generateSlots("et-1");
  assert.ok(et1Slots.length > 0);

  const target = et1Slots[0];
  createBooking({ slotId: target.id, guestName: "Alice", guestEmail: "alice@example.com" });

  const conflictingSlotId = `et-2__${target.startTime}`;
  assert.throws(() =>
    createBooking({
      slotId: conflictingSlotId,
      guestName: "Bob",
      guestEmail: "bob@example.com",
    }),
  );
});

test("shared availability logic keeps generateSlots and createBooking consistent", () => {
  const et2Slots = generateSlots("et-2");
  assert.ok(et2Slots.length > 0);

  const target = et2Slots[0];
  const before = generateSlots("et-2").map((s) => s.id).includes(target.id);
  assert.equal(before, true);

  createBooking({ slotId: target.id, guestName: "Carol", guestEmail: "carol@example.com" });

  const after = generateSlots("et-2");
  assert.equal(after.some((s) => s.id === target.id), false);

  assert.throws(() =>
    createBooking({ slotId: target.id, guestName: "Dave", guestEmail: "dave@example.com" }),
  );
});
