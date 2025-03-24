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

    const routes = createRoutes().add(uniqueRoute);

    expect(() => routes.add(duplicateRoute)).toThrowError(
      "Route for POST /unique already exists",
    );
  });

  test("adds a route and returns it via getRoutes", () => {
    const routes = createRoutes();

    const getRoute = route(
      { method: "GET", path: "/hello" },
      () => new Response("Hello"),
    );

    routes.add(getRoute);

    const result = routes.getRoutes();
    expect(result["/hello"]).toBeDefined();
    expect(result["/hello"].GET).toBeInstanceOf(Function);
  });

  test("can add multiple methods for the same path", () => {
    const routes = createRoutes();

    const getRoute = route(
      { method: "GET", path: "/things" },
      () => new Response("GET things"),
    );
    const postRoute = route(
      { method: "POST", path: "/things" },
      () => new Response("POST things"),
    );

    routes.add(getRoute);
    routes.add(postRoute);

    const result = routes.getRoutes();
    expect(result["/things"].GET).toBeDefined();
    expect(result["/things"].POST).toBeDefined();
  });
});
