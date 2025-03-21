import type { RouterTypes } from "bun";

/**
 * Creates a router that manages route handlers.
 *
 * This function returns an object with two methods:
 * - `add`: Registers a new route.
 * - `getRoutes`: Returns all registered routes.
 *
 * The router ensures that duplicate route definitions (same HTTP method and path)
 * are not allowed. If a duplicate is detected, an error is thrown.
 *
 * @returns An object with `add` and `getRoutes` functions.
 */
export function createRoutes() {
	const routes: Record<string, RouterTypes.RouteHandlerObject<string>> = {};

	/**
	 * Adds a new route to the router.
	 *
	 * @returns An object with `add` and `getRoutes` methods (allowing for method chaining).
	 * @throws Error if a route for the given HTTP method and path already exists.
	 */
	function add<T extends string>(
		route: [T, RouterTypes.RouteHandlerObject<T>],
	) {
		const [path, handlers] = route;

		if (!routes[path]) {
			routes[path] = {};
		}

		for (const method of Object.keys(handlers)) {
			if (!isHTTPMethod(method)) continue;

			const handler = handlers[method];
			if (handler !== undefined) {
				if (routes[path][method] !== undefined) {
					throw new Error(`Route for ${method} ${path} already exists`);
				}
				routes[path][method] = handler;
			}
		}

		return { add, getRoutes };
	}

	/**
	 * Retrieves all registered routes.
	 *
	 * @returns A record where keys are route paths and values are route handler objects,
	 *          each mapping HTTP methods to their corresponding handlers.
	 */
	function getRoutes(): Record<string, RouterTypes.RouteHandlerObject<string>> {
		return { ...routes };
	}

	return { add, getRoutes };
}

/**
 * Type guard to verify that a string is a valid RouterTypes.HTTPMethod.
 */
function isHTTPMethod(key: string): key is RouterTypes.HTTPMethod {
	return (
		key === "GET" ||
		key === "POST" ||
		key === "PUT" ||
		key === "DELETE" ||
		key === "PATCH" ||
		key === "HEAD" ||
		key === "OPTIONS"
	);
}
