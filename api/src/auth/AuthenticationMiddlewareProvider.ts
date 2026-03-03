import winston from "winston";
import { injectable } from "tsyringe";
import { Request, Response, NextFunction } from "express";
import { ConfigOptions } from "../config.js";
import UnauthorizedException from "../middleware/UnauthorizedException.js";
import LoggerProvider from "../utils/LoggerProvider.js";
import JwtValidationService from "./JwtValidationService.js";
import User from "./User.js";

@injectable()
export default class AuthMiddlewareProvider {
  private logger: winston.Logger;

  constructor(
    protected loggerProvider: LoggerProvider,
    protected config: ConfigOptions,
    protected jwtValidationService: JwtValidationService
  ) {
    this.logger = loggerProvider.provide("AuthMiddlewareProvider");
  }

  /** Provide array of "isAuthenticated" and "isAuthorized" middleware */
  public provide() {
    const isAuthenticated = async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      if (
        !req.headers ||
        !req.headers.authorization ||
        req.headers.authorization === ""
      ) {
        throw new UnauthorizedException();
      }

      const authHeader = req.headers.authorization;

      try {
        // Validate JWT
        const user = await this.jwtValidationService.validate(authHeader);

        // Inject User to request-level dependency injection container
        const requestContainer = res.locals.container;
        requestContainer.register(User, { useValue: user });

        // Continue to next middleware
        next();
      } catch (e: any) {
        this.logger.info("Invalid jwt", { e });
        throw new UnauthorizedException();
      }
    };

    return isAuthenticated;
  }
}
