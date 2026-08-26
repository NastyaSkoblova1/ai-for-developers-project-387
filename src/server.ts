import "dotenv/config";
import { buildApp } from "./app.js";
import { seedData } from "./storage/seed.js";

seedData();

const app = buildApp();

const port = Number(process.env.PORT || "3000");
const host = process.env.HOST || "0.0.0.0";

try {
  await app.listen({ port, host });
  console.log(`Server listening on http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
