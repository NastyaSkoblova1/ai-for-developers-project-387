import type { FastifyInstance } from "fastify";
import { listEventTypes } from "../services/event-types.js";
import { generateSlots } from "../services/slots.js";
import { createBooking } from "../services/bookings.js";
import { ApiError } from "../lib/errors.js";

export async function publicRoutes(app: FastifyInstance): Promise<void> {
  app.get("/event-types", async (_req, reply) => {
    const items = listEventTypes();
    return reply.send({ items });
  });

  app.get("/event-types/:id/slots", async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const items = generateSlots(id);
      return reply.send({ items });
    } catch (err) {
      if (err instanceof ApiError) {
        return reply.status(err.statusCode).send({ code: err.code, message: err.message });
      }
      throw err;
    }
  });

  app.post("/bookings", async (req, reply) => {
    const body = req.body as {
      slotId: string;
      guestName: string;
      guestEmail: string;
      guestPhone?: string;
    };
    try {
      const booking = createBooking(body);
      return reply.send(booking);
    } catch (err) {
      if (err instanceof ApiError) {
        return reply.status(err.statusCode).send({ code: err.code, message: err.message });
      }
      throw err;
    }
  });
}
