import type { BunRequest, RouterTypes, Server } from "bun";

export type Middleware<T extends string> = (
  req: BunRequest<T>,
  server: Server,
  next: () => Response | Promise<Response>,
) => Response | Promise<Response>;

export function middleware<T extends string>(fn: Middleware<T>): Middleware<T> {
  return fn;
}

export function composeMiddlewares<T extends string>(
  middlewares: readonly Middleware<T>[],
  finalHandler: RouterTypes.RouteHandler<T>,
): RouterTypes.RouteHandler<T> {
  return async (req: BunRequest<T>, server: Server) => {
    const execute = async (middlewareIndex: number): Promise<Response> => {
      if (middlewareIndex >= middlewares.length) {
        return finalHandler(req, server);
      }

      let hasNextBeenCalled = false;
      const middleware = middlewares[middlewareIndex];

      const next = async () => {
        if (hasNextBeenCalled) {
          throw new Error("next() called multiple times");
        }
        hasNextBeenCalled = true;
        return execute(middlewareIndex + 1);
      };

      return middleware(req, server, next);
    };

    return execute(0);
  };
}
