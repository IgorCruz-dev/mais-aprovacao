import "dotenv/config";
import Fastify from "fastify";
import { clerkPlugin } from "@clerk/fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { healthRoute } from "./routes/health.js";
import { clerkWebhookRoutes } from "./routes/webhooks/clerk.js";
import { meRoutes } from "./routes/me/index.js";
import { parentRoutes } from "./routes/parent/index.js";
import { adminUserRoutes } from "./routes/admin/users.js";
import { adminParentLinkRoutes } from "./routes/admin/parent-links.js";
import { questionRoutes } from "./routes/questions/index.js";
import { questionAttemptRoutes } from "./routes/question-attempts/index.js";
import { examSessionRoutes } from "./routes/exam-sessions/index.js";
import { questionReportRoutes } from "./routes/question-reports/index.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: process.env.WEB_URL ?? "http://localhost:3000" });
await app.register(helmet);

// Rotas públicas — antes do Clerk (webhooks validam assinatura própria)
app.register(healthRoute);
app.register(clerkWebhookRoutes);

await app.register(clerkPlugin);

app.register(meRoutes);
app.register(parentRoutes);
app.register(adminUserRoutes);
app.register(adminParentLinkRoutes);
app.register(questionRoutes);
app.register(questionAttemptRoutes);
app.register(examSessionRoutes);
app.register(questionReportRoutes);

const port = Number(process.env.PORT ?? 3001);

app.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
