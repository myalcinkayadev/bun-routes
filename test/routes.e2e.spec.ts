import type { Server } from "bun";
import { test, expect, describe, afterAll, beforeAll } from "bun:test";
import { createRoutes, route } from "../src";

describe("routes - e2e", () => {
	const helloRoute = route(
		{ method: "GET", path: "/hello/:id" },
		(req) => new Response(`Hello ${req.params.id}`),
	);

	const userGetRoute = route(
		{ method: "GET", path: "/users/:id" },
		(req) => new Response(`User ${req.params.id}`),
	);

	const userPostRoute = route(
		{ method: "POST", path: "/users" },
		() => new Response("User created"),
	);

	const userPatchRoute = route(
		{ method: "PATCH", path: "/users/:id" },
		(req) => new Response(`User updated: ${req.params.id}`),
	);

	let server: Server;

	beforeAll(() => {
		const routes = createRoutes()
			.add(helloRoute)
			.add(userGetRoute)
			.add(userPostRoute)
			.add(userPatchRoute);

		server = Bun.serve({ port: 0, routes: routes.getRoutes() });
	});

	afterAll(() => {
		server.stop();
	});

	test("GET /hello/:id returns expected greeting", async () => {
		const url = `http://localhost:${server.port}/hello/123`;
		const res = await fetch(url);
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toBe("Hello 123");
	});

	test("GET /users/:id returns expected user info", async () => {
		const url = `http://localhost:${server.port}/users/myalcinkayadev`;
		const res = await fetch(url);
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toBe("User myalcinkayadev");
	});

	test("POST /users returns 'User created'", async () => {
		const url = `http://localhost:${server.port}/users`;
		const res = await fetch(url, { method: "POST" });
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toBe("User created");
	});

	test("PATCH /users/:id returns expected update response", async () => {
		const url = `http://localhost:${server.port}/users/myalcinkayadev`;
		const res = await fetch(url, { method: "PATCH" });
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toBe("User updated: myalcinkayadev");
	});
});
