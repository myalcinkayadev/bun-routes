import { describe, expect, test } from "bun:test";
import { createRoutes, route } from "../src";

describe("routes - unit", () => {
	test("duplicate route registration throws error", () => {
		const uniqueRoute = route({ method: "POST", path: "/unique" }, () =>
			Response.json({ answer: 42 }),
		);
		const duplicateRoute = route({ method: "POST", path: "/unique" }, () =>
			Response.json({ answer: 42 }),
		);

		const router = createRoutes().add(uniqueRoute);

		expect(() => router.add(duplicateRoute)).toThrowError(
			"Route for POST /unique already exists",
		);
	});
});
