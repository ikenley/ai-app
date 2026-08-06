import { asValue } from "awilix";
import type { Request, Response, NextFunction } from "express";
import UnauthorizedException from "../middleware/UnauthorizedException.ts";
import { getRequestScope } from "../container/getRequestScope.ts";

/**
 * Provides the "isAuthenticated" middleware.
 *
 * App-lifetime, and deliberately stateless: it registers its handler once at
 * boot, so anything captured in a constructor would be frozen for the life of
 * the process. That is exactly what used to happen — a logger built at boot
 * carried `requestId: NIL` on every line it ever wrote. Request-scoped
 * dependencies are resolved per request from res.locals.scope instead.
 */
export default class AuthenticationMiddlewareProvider {
  /** Provide the "isAuthenticated" middleware */
  public provide() {
    const isAuthenticated = async (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      if (
        !req?.headers?.authorization ||
        req.headers.authorization === ""
      ) {
        throw new UnauthorizedException();
      }

      const authHeader = req.headers.authorization;
      const scope = getRequestScope(res);

      try {
        // Validate JWT
        const user =
          await scope.cradle.jwtValidationService.validate(authHeader);

        // Inject User into the request scope, for everything downstream
        scope.register({ user: asValue(user) });

        // Continue to next middleware
        next();
      } catch (e: any) {
        const logger = scope.cradle.loggerProvider.provide(
          "AuthenticationMiddlewareProvider",
        );
        logger.info("Invalid jwt", { e });
        throw new UnauthorizedException();
      }
    };

    return isAuthenticated;
  }
}
