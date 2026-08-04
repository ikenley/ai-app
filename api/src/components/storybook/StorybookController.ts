import { Request, Response, Router } from "express";
import { CreateStoryParams } from "../../types/index.js";
import type { ApiCradle } from "../../container/Cradle.js";
import { getRequestScope } from "../../container/getRequestScope.js";
import AuthenticationMiddlewareProvider from "../../auth/AuthenticationMiddlewareProvider.js";
import AuthorizationMiddleware from "../../auth/AuthorizationMiddleware.js";

const route = Router();

export default class StorybookController {
  protected authenticationMiddlewareProvider: AuthenticationMiddlewareProvider;
  protected authorizationMiddleware: AuthorizationMiddleware;

  constructor({
    authenticationMiddlewareProvider,
    authorizationMiddleware,
  }: ApiCradle) {
    this.authenticationMiddlewareProvider = authenticationMiddlewareProvider;
    this.authorizationMiddleware = authorizationMiddleware;
  }

  public registerRoutes(app: Router) {
    app.use("/storybook", route);

    route.use(this.authenticationMiddlewareProvider.provide());
    route.use(this.authorizationMiddleware.isAuthorized);

    route.post(
      "/",
      async (req: Request<{}, {}, CreateStoryParams>, res: Response) => {
        const { storybookService } = getRequestScope(res).cradle;
        await storybookService.create(req.body);
        res.send({});
      }
    );
  }
}
