import fastify from "fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { renderTrpcPanel } from "trpc-ui";
import { appRouter } from "./router";
import "dotenv/config";

const server = fastify({
  logger: true,
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

// tRPC Panel for testing (development only)
if (process.env.NODE_ENV !== "production") {
  server.get("/panel", async (_, reply) => {
    const html = renderTrpcPanel(appRouter, {
      url: "http://localhost:3001/trpc",
    });

    reply.type("text/html");
    return html;
  });
}

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
