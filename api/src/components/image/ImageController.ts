import { Request, Response, Router } from "express";
import { RequestImageParams } from "../../types/index.js";
import type { ApiCradle } from "../../container/Cradle.js";
import { getRequestScope } from "../../container/getRequestScope.js";
import AuthenticationMiddlewareProvider from "../../auth/AuthenticationMiddlewareProvider.js";
import AuthorizationMiddleware from "../../auth/AuthorizationMiddleware.js";

const route = Router();

export default class ImageController {
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
    app.use("/image", route);

    route.use(this.authenticationMiddlewareProvider.provide());
    route.use(this.authorizationMiddleware.isAuthorized);

    route.post(
      "/",
      async (req: Request<{}, {}, RequestImageParams>, res: Response) => {
        const { imageMetadataService } = getRequestScope(res).cradle;
        await imageMetadataService.publishImageRequest(req.body);
        res.send({});
      }
    );
  }
}
