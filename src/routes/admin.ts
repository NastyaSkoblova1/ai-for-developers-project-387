import type { FastifyInstance } from "fastify";
import { memoryStore } from "../storage/memory-store.js";
import {
  listEventTypes,
  getEventType,
  createEventType,
  updateEventType,
  deleteEventType,
} from "../services/event-types.js";
import { listBookings } from "../services/bookings.js";
import { ApiError } from "../lib/errors.js";

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  app.get("/admin/owner", async (_req, reply) => {
    return reply.send(memoryStore.owner);
  });

  app.get("/admin/event-types", async (_req, reply) => {
    const items = listEventTypes();
    return reply.send({ items });
  });

  app.post("/admin/event-types", async (req, reply) => {
    const body = req.body as {
      name: string;
      description: string;
      durationMinutes: number;
    };
    const et = createEventType(body);
    return reply.send(et);
  });

  app.get("/admin/event-types/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const et = getEventType(id);
      return reply.send(et);
    } catch (err) {
      if (err instanceof ApiError) {
        return reply.status(err.statusCode).send({ code: err.code, message: err.message });
      }
      throw err;
    }
  });

  app.patch("/admin/event-types/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as Partial<{
      name: string;
      description: string;
      durationMinutes: number;
    }>;
    try {
      const et = updateEventType(id, body);
      return reply.send(et);
    } catch (err) {
      if (err instanceof ApiError) {
        return reply.status(err.statusCode).send({ code: err.code, message: err.message });
      }
      throw err;
    }
  });

  app.delete("/admin/event-types/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      deleteEventType(id);
      return reply.status(204).send();
    } catch (err) {
      if (err instanceof ApiError) {
        return reply.status(err.statusCode).send({ code: err.code, message: err.message });
      }
      throw err;
    }
  });

  app.get("/admin/bookings", async (_req, reply) => {
    const items = listBookings();
    return reply.send({ items });
  });
}
