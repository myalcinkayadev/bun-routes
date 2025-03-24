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
import { route, Middleware } from "bun-routes";

	const logger: Middleware<string> = async (req, _server, next) => {
		console.log("Request URL:", req.url);
		return next();
	};

	const authMiddleware: Middleware<string> = async (req, _server, next) => {
		if (!req.headers.get("Authorization")) {
			return new Response("Unauthorized", { status: 401 });
		}
		return next();
	};

const auth: Middleware = async (req, server, next) => {
  const authorized = req.headers.get("Authorization") === "Bearer secret";
  if (!authorized) {
    return new Response("Unauthorized", { status: 401 });
  }
  return next();
};

// Route using middleware
const secureRoute = route(
  {
    expose: true,
    method: "GET",
    path: "/secure/:id",
    middlewares: [loggerMiddleware, authMiddleware],
  },
  (req) => Response.json({ secure: true, userId: req.params.id })
);
```
