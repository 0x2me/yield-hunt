import fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import rateLimit from "@fastify/rate-limit";
import { appRouter } from "./router";
import "dotenv/config";

const server = fastify({
  logger: true,
});

// Register rate limiting
server.register(rateLimit, {
  max: 5, // 5 requests for testing
  timeWindow: 60000, // 1 minute in milliseconds
  errorResponseBuilder: function (request, context) {
    return {
      code: 429,
      error: "Too Many Requests",
      message: `Rate limit exceeded, retry in ${context.ttl} seconds. Max ${context.max} requests per minute.`,
      date: Date.now(),
      expiresIn: context.ttl,
    };
  },
});

// Register tRPC plugin
server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter },
});

// Health check endpoint
server.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    const host =
      process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

    await server.listen({ port, host });
    console.log(`🚀 Server listening on ${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
