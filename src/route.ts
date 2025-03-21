import type { RouterTypes } from "bun";

/**
 * Options for creating a route.
 *
 * @template T - The route path type, which may include dynamic parameters.
 */
export interface RouteOptions<T extends string> {
	/**
	 * Indicates whether the route should be exposed.
	 * If false, the route will return a default 404 response.
	 */
	expose?: boolean;
	/**
	 * The HTTP method for the route.
	 * This must be one of the supported methods defined in RouterTypes.
	 */
	method: RouterTypes.HTTPMethod;
	/**
	 * The path for the route.
	 * This can include dynamic parameters (e.g., "/users/:id").
	 */
	path: T;
}

/**
 * Creates a route tuple with the provided options and final handler.
 * If the route is not exposed, returns a default 404 handler.
 * If middlewares are provided, they are composed with the final handler.
 *
 * @param options - Route configuration options.
 * @param handler - The final route handler.
 * @returns A tuple containing the route path and a RouteHandlerObject.
 */
export function route<T extends string>(
	options: RouteOptions<T>,
	handler: RouterTypes.RouteHandler<T>,
): [T, RouterTypes.RouteHandlerObject<T>] {
	const { method, path, expose } = options;

	if (!expose) {
		return [path, { [method]: () => new Response(null, { status: 404 }) }];
	}

	return [path, { [method]: handler }];
}
