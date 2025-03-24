import { test, expect, describe, afterAll, beforeAll } from "bun:test";
import type { Server } from "bun";
import { createRoutes, route, type Middleware } from "../src";

describe("middleware - e2e", () => {
  // Define a couple of middleware functions.
  const loggerMiddleware: Middleware<string> = async (req, _server, next) => {
    console.log("Request URL:", req.url);
    return next();
  };

  const authMiddleware: Middleware<string> = async (req, _server, next) => {
    if (!req.headers.get("Authorization")) {
      return new Response("Unauthorized", { status: 401 });
    }
    return next();
  };

  // Create a route with middleware.
  const secureRoute = route(
    {
      expose: true,
      method: "GET",
      path: "/secure/:id",
      middlewares: [loggerMiddleware, authMiddleware],
    },
    (req) => Response.json({ message: "Success", params: req.params }),
  );

  const routes = createRoutes().add(secureRoute);

  let server: Server;

  beforeAll(() => {
    server = Bun.serve({
      port: 0,
      routes: routes.getRoutes(),
    });
  });

  afterAll(() => {
    server.stop();
  });

  test("GET /secure/:id with proper Authorization returns success", async () => {
    const url = `http://localhost:${server.port}/secure/123`;
    const res = await fetch(url, {
      headers: { Authorization: "Bearer token" },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ message: "Success", params: { id: "123" } });
  });

  test("GET /secure/:id without Authorization returns 401", async () => {
    const url = `http://localhost:${server.port}/secure/123`;
    const res = await fetch(url);
    expect(res.status).toBe(401);
    const text = await res.text();
    expect(text).toBe("Unauthorized");
  });
});
