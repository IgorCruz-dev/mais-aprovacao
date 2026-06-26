import "dotenv/config";
import Fastify from "fastify";
import { clerkPlugin } from "@clerk/fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { healthRoute } from "./routes/health.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: process.env.WEB_URL ?? "http://localhost:3000" });
await app.register(helmet);

// Rota pública — antes do Clerk
app.register(healthRoute);

await app.register(clerkPlugin);

app.listen({ port: 3001, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
