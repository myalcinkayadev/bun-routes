import type { BunRequest, Server } from "bun";
import { test, expect, describe } from "bun:test";
import { route } from "../src";

describe("route - unit", () => {
	// Create a minimal mock for the request and server.
	const mockRequest = { params: {} } as BunRequest<string>;
	const mockServer = {} as Server;

	test("returns default 404 when expose is false", async () => {
		const [path, handler] = route(
			{ expose: false, method: "GET", path: "/test" },
			() => new Response("Should not run"),
		);

		expect(path).toBe("/test");
		expect(handler.GET).toBeDefined();
		const response = await handler.GET!(mockRequest, mockServer);
		expect(response.status).toBe(404);
	});
});
