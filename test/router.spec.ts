import { test, expect } from "bun:test";
import { createRoutes, route } from "../src";

test("adds a route and returns it via getRoutes", () => {
	const router = createRoutes();

	const getRoute = route(
		{ expose: true, method: "GET", path: "/hello" },
		() => new Response("Hello"),
	);

	router.add(getRoute);

	const routes = router.getRoutes();
	expect(routes["/hello"]).toBeDefined();
	expect(routes["/hello"].GET).toBeInstanceOf(Function);
});

test("throws if adding duplicate route for same method and path", () => {
	const router = createRoutes();
	const userRoute = route(
		{ expose: true, method: "GET", path: "/users/:id" },
		() => new Response("User"),
	);

	router.add(userRoute);

	expect(() => router.add(userRoute)).toThrowError(
		"Route for GET /users/:id already exists",
	);
});

test("can add multiple methods for the same path", () => {
	const router = createRoutes();

	const getRoute = route(
		{ expose: true, method: "GET", path: "/things" },
		() => new Response("GET things"),
	);
	const postRoute = route(
		{ expose: true, method: "POST", path: "/things" },
		() => new Response("POST things"),
	);

	router.add(getRoute);
	router.add(postRoute);

	const routes = router.getRoutes();
	expect(routes["/things"].GET).toBeDefined();
	expect(routes["/things"].POST).toBeDefined();
});
