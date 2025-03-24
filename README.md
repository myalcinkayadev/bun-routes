<p align="center">
    <img src="logo.webp" width="300px" align="center" alt="Bun Routes logo" />
    <h1 align="center">Bun Routes</h1>
</p>

**Bun Routes** is a lightweight, type-safe router built for Bun with **zero dependencies**. It’s designed to be minimal, unopinionated, and simple—ideal for developers who want full control without the complexity of a full framework.

> **Note:** Bun Routes requires **Bun v1.2.3+** for using the `routes` API.

## Why Bun Routes?
- ⚡ **Simple API:** Easy to use with familiar patterns.
- 🔒 **Type-Safe:** Leverages native Bun types for complete type safety.
- 🧘‍♂️ **Minimal & Unopinionated:** Just routing, nothing else.
- 🧩 **Flexible:** Easily add middleware and handle different HTTP methods for each route.

## Installation
```bash
bun add bun-routes
```

## Basic Usage

```typescript
import { createRoutes, route } from "bun-routes";

// Define a GET route for fetching a user by ID
const userGetRoute = route({ method: "GET", path: "/users/:id" }, (req) =>
	Response.json({ userId: req.params.id }),
);

// Define a POST route for creating a user
const userPostRoute = route({ method: "POST", path: "/users/:id" }, (req) =>
	Response.json({ userId: req.params.id }),
);

// Create an instance and add routes
const routes = createRoutes().add(userGetRoute).add(userPostRoute);

// Start your server using Bun.serve
const server = Bun.serve({
	port: Number(process.env.PORT) || 4000,
	routes: routes.getRoutes(),
});

console.info(`🚀 Server is running on http://localhost:${server.port}`);
```

## Routing in Bun: Comparing Two Approaches
**Inline Object Literal Routing** is the [native method](https://bun.sh/docs/api/http#bun-serve) in Bun, offering a simple and direct approach to routing without additional abstractions.

| Aspect                   | Inline Object Literal Routing (bun)                                       | Programmatic Routing (bun-routes)                                    |
|--------------------------|--------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| **Simplicity**           | Simple and direct for small projects                               | Slightly more complex due to additional abstractions                                          |
| **Modularity**           | Less modular; all routes are defined in one large object             | Highly modular; routes are encapsulated as individual objects                                 |
| **Maintainability**      | Can become unwieldy as the number of routes grows                    | Easier to maintain, especially in larger applications                                          |
| **HTTP Method Handling** | Less explicit when managing multiple methods on the same route       | Clearly declares HTTP methods for each route                                                  |
| **Extensibility**        | Limited integration for middleware and additional features (currently)           | Enhanced flexibility for middleware and route-specific processing                              |

## Middleware Example
```typescript
import { createRoutes, route, middleware } from "bun-routes";

// Simulated in-memory cache for demonstration
const responseCache = new Map<string, Response>();

const logger = middleware(async (req, _server, next) => {
  const startTime = Date.now();
  console.log(
    `[${new Date().toISOString()}] Request started: ${req.method} ${req.url}`,
  );

  const result = await next();

  const duration = Date.now() - startTime;
  console.log(
    `[${new Date().toISOString()}] Request completed: ${req.method} ${req.url} in ${duration}ms`,
  );
  return result;
});

const auth = middleware((req, _server, next) => {
  const authHeader = req.headers.get("Authorization");
  const isAuthorized = authHeader === "Bearer secret";

  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return next();
});

const cache = middleware(async (req, _server, next) => {
  const cacheKey = `${req.method}:${req.url}`;
  console.log(`Checking cache for ${cacheKey}`);

  const cachedResponse = responseCache.get(cacheKey);
  if (cachedResponse) {
    console.log(`Cache hit for ${cacheKey}`);
    return cachedResponse.clone();
  }

  // Process the next middleware/handler
  const response = await next();

  // Cache the response if it’s successful
  if (response.ok) {
    console.log(`Caching response for ${cacheKey}`);
    responseCache.set(cacheKey, response.clone()); // Clone to store independently
  } else {
    console.log(`Not caching failed response for ${cacheKey}`);
  }

  return response;
});

type User = {
  id: string;
  name: string;
  email: string;
};

async function fetchUserDetails(userId: string): Promise<User> {
  // Simulate async DB call
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    id: userId,
    name: "John Doe",
    email: "john@example.com",
  };
}

// Secure route with enhanced logic
const secureRoute = route(
  {
    method: "GET",
    path: "/secure/:id/details",
    middlewares: [auth, logger, cache],
  },
  async (req) => {
    const userId = req.params.id;

    try {
      // Fetch user details asynchronously
      const userDetails = await fetchUserDetails(userId);

      return Response.json({ user: userDetails });
    } catch (error) {
      console.error(`Error fetching user details for ID ${userId}:`, error);
      return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
  },
);
```
