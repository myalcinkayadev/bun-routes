<p align="center">
    <img src="logo.webp" width="300px" align="center" alt="Bun Routes logo" />
    <h1 align="center">Bun Routes</h1>
</p>

**Bun Routes** is a lightweight, type-safe router built for Bun with **zero dependencies**. It’s designed to be minimal, unopinionated, and simple—ideal for developers who want full control without the complexity of a full framework.

## Why Bun Routes?
- ⚡ **Simple API:** Easy to use with familiar patterns.
- 🔒 **Type-Safe:** Leverages native Bun types for complete type safety.
- 🧘‍♂️ **Minimal & Unopinionated:** Just routing, nothing else.

## Installation
```bash
bun add bun-routes
```

## Basic Usage

```typescript
import { createRoutes, route } from "bun-routes";

// Define a GET route for fetching a user by ID
const userGetRoute = route(
  { expose: true, method: "GET", path: "/users/:id" },
  (req) => Response.json({ userId: req.params.id })
);

// Define a POST route for creating a user
const userPostRoute = route(
  { expose: true, method: "POST", path: "/users/:id" },
  (req) => Response.json({ userId: req.params.id })
);

// Create a router instance and add routes
const router = createRoutes();
router.add(userGetRoute);
router.add(userPostRoute);

// Start your server using Bun.serve
const server = Bun.serve({
  port: Number(process.env.PORT) || 4000,
  routes: router.getRoutes(),
});

console.info(`🚀 Server is running on http://localhost:${server.port}`);
```
