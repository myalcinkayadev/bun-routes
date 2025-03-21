import { test, expect } from "bun:test";
import { createRoutes, route } from "../src";

test("GET /users/:id returns expected response", async () => {
	const router = createRoutes();
	const getRoute = route(
		{ expose: true, method: "GET", path: "/users/:id" },
		(req) => Response.json({ userId: req.params.id }),
	);
	router.add(getRoute);

	const server = Bun.serve({
		port: 0,
		routes: router.getRoutes(),
	});

	try {
		const url = `http://localhost:${server.port}/users/42`;
		const res = await fetch(url);

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ userId: "42" });
	} finally {
		server.stop();
	}
});

test("POST /users/:id response", async () => {
	const router = createRoutes();

	const postRoute = route(
		{ expose: true, method: "POST", path: "/users/:id" },
		async (req) => {
			return Response.json({ userId: req.params.id });
		},
	);

	router.add(postRoute);

	const server = Bun.serve({
		port: 0,
		routes: router.getRoutes(),
	});

	try {
		const url = `http://localhost:${server.port}/users/123`;
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
		});

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ userId: "123" });
	} finally {
		server.stop();
	}
});
