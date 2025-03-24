import { test, expect, describe } from "bun:test";
import type { BunRequest, RouterTypes, Server } from "bun";
import { composeMiddlewares, type Middleware } from "../src";

describe("middleware - unit", () => {
	// Create minimal mocks for BunRequest and Server
	const mockRequest = { params: {} } as BunRequest<string>;
	const mockServer = {} as Server;

	test("composeMiddlewares calls final route when no middleware", async () => {
		const finalHandler: RouterTypes.RouteHandler<string> = () =>
			new Response("Final");

		const composed = composeMiddlewares([], finalHandler);
		const response = await composed(mockRequest, mockServer);

		expect(await response.text()).toBe("Final");
	});

	test("composeMiddlewares executes middleware chain in order", async () => {
		let order: string[] = [];

		const mw1: Middleware<string> = async (_req, _server, next) => {
			order.push("mw1-before");
			const resp = await next();
			order.push("mw1-after");
			return resp;
		};

		const mw2: Middleware<string> = async (_req, _server, next) => {
			order.push("mw2-before");
			const resp = await next();
			order.push("mw2-after");
			return resp;
		};

		const finalHandler: RouterTypes.RouteHandler<string> = () => {
			order.push("final");
			return new Response("OK");
		};

		const composed = composeMiddlewares([mw1, mw2], finalHandler);
		const response = await composed(mockRequest, mockServer);

		expect(await response.text()).toBe("OK");
		expect(order).toEqual([
			"mw1-before",
			"mw2-before",
			"final",
			"mw2-after",
			"mw1-after",
		]);
	});

	test("composeMiddlewares stops chain if a middleware returns early", async () => {
		const mw1: Middleware<string> = async () => {
			return new Response("Stopped");
		};

		const finalHandler: RouterTypes.RouteHandler<string> = () =>
			new Response("Final");
		const composed = composeMiddlewares([mw1], finalHandler);

		const response = await composed(mockRequest, mockServer);
		expect(await response.text()).toBe("Stopped");
	});

	test("composeMiddlewares throws error if next() is called twice", async () => {
		const mw: Middleware<string> = async (_req, _server, next) => {
			await next();
			// Call next() a second time, which should throw.
			return next();
		};

		const finalHandler: RouterTypes.RouteHandler<string> = (r) =>
			new Response("Final");
		const composed = composeMiddlewares([mw], finalHandler);

		expect(composed(mockRequest, mockServer)).rejects.toThrow(
			"next() called multiple times",
		);
	});
});
