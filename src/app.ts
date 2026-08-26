import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import { publicRoutes } from "./routes/public.js";
import { adminRoutes } from "./routes/admin.js";

export function buildApp() {
  const app = fastify({ logger: true });

  if (process.env.NODE_ENV !== "production") {
    const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
    app.register(cors, {
      origin: frontendOrigin,
    });
  }

  const distPath = path.resolve(process.cwd(), "frontend/dist");

  app.register(fastifyStatic, {
    root: distPath,
    prefix: "/",
    wildcard: true,
  });

  app.addContentTypeParser(
    "application/merge-patch+json",
    { parseAs: "string" },
    function (_req, body, done) {
      try {
        const json = JSON.parse(body as string);
        done(null, json);
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  app.register(publicRoutes, { prefix: "/api" });
  app.register(adminRoutes, { prefix: "/api" });

  app.setNotFoundHandler(async (req, reply) => {
    if (req.url.startsWith("/api/")) {
      return reply.status(404).send({ code: 404, message: "Not Found" });
    }
    return reply.sendFile("index.html", distPath);
  });

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    const err = error as Error & { statusCode?: number };
    if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
      return reply.status(err.statusCode).send({
        code: err.statusCode,
        message: err.message,
      });
    }
    return reply.status(500).send({
      code: 500,
      message: "Internal Server Error",
    });
  });

  return app;
}
