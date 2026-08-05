import type { AwilixContainer } from "awilix";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import methodOverride from "method-override";
import logger from "./logger.ts";
import { ConfigOptions, getConfigOptions } from "../config/index.ts";
import requestScopeMiddleware from "../middleware/requestScopeMiddleware.ts";
import exceptionMiddleware from "../middleware/exceptionMiddleware.ts";
import RouteService from "../routes/RouteService.ts";
import type { ApiCradle } from "../container/Cradle.ts";

const getCorsOrigin = (config: ConfigOptions) => {
  const { baseDomain, app } = config;
  if (!baseDomain || baseDomain === "" || app.env === "local") {
    return undefined;
  }

  const domainPattern = baseDomain.replace(/\./g, "\\.");
  return new RegExp(`${domainPattern}:?\\d*$`);
};

export default class ExpressLoader {
  protected routeService: RouteService;

  constructor({ routeService }: ApiCradle) {
    this.routeService = routeService;
  }

  /** Takes the root container so the request-scope middleware can create a
   *  child scope per request. The container cannot arrive through the cradle —
   *  it is what builds the cradle — so the entrypoint passes it in. */
  public load(app: express.Application, container: AwilixContainer<ApiCradle>) {
    const config = getConfigOptions();
    // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    // It shows the real origin IP in the heroku or Cloudwatch logs
    app.enable("trust proxy");

    // Security against common threats
    app.use(helmet());

    const corsConfig = {
      origin: getCorsOrigin(config),
    };
    app.use(cors(corsConfig));

    // "Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it."
    app.use(methodOverride());

    // Transforms the raw string of req.body into json
    app.use(express.json());

    // Log HTTP requests
    app.use(
      morgan("combined", {
        stream: {
          // Configure Morgan to use our custom logger with the http severity
          write: (message) => logger.http(message.trim()),
        },
      })
    );

    // Load API routes
    app.use(config.api.prefix, requestScopeMiddleware(container));
    app.use(config.api.prefix, this.routeService.registerRoutes());

    /// catch 404 and forward to error handler
    app.use((_req, _res, next) => {
      const err: any = new Error("Not Found");
      err["status"] = 404;
      next(err);
    });

    /// error handlers
    app.use((err: any, _req: any, res: any, next: any) => {
      /**
       * Handle 401 thrown by express-jwt library
       */
      if (err.name === "UnauthorizedError") {
        return res.status(err.status).send({ message: err.message }).end();
      }
      return next(err);
    });
    app.use(exceptionMiddleware);
  }
}
