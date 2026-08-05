import type { Request, Response, NextFunction } from "express";
import { ConfigOptions } from "../config/index.ts";
import type { ApiCradle } from "../container/Cradle.ts";
import { getRequestScope } from "../container/getRequestScope.ts";
import ForbiddenException from "../middleware/ForbiddenException.ts";

/** Checks whether a user is on a narrow allow-list */
export default class AuthorizationMiddleware {
  protected config: ConfigOptions;

  /** Only app-lifetime config is held here. The user and the logger are
   *  request-scoped, so they are read from the scope on each request. */
  constructor({ config }: ApiCradle) {
    this.config = config;
  }

  /** Middleware which rejects users who are not on the allow-list */
  public isAuthorized = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const scope = getRequestScope(res);
    const user = scope.cradle.user;

    // If user on authorized emails list, continue
    if (this.config.authorizedEmails.includes(user.email)) {
      next();
    }
    // else return 403 error
    else {
      const logger = scope.cradle.loggerProvider.provide(
        "AuthorizationMiddleware"
      );
      logger.info("Unauthorized user", { email: user.email });
      throw new ForbiddenException();
    }
  };
}
