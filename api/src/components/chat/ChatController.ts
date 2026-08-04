import { Request, Response, Router } from "express";
import { SendChatParams } from "../../types/index.js";
import type { ApiCradle } from "../../container/Cradle.js";
import { getRequestScope } from "../../container/getRequestScope.js";
import AuthenticationMiddlewareProvider from "../../auth/AuthenticationMiddlewareProvider.js";
import AuthorizationMiddleware from "../../auth/AuthorizationMiddleware.js";

const route = Router();

export default class ChatController {
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
    app.use("/chat", route);

    route.use(this.authenticationMiddlewareProvider.provide());
    route.use(this.authorizationMiddleware.isAuthorized);

    route.post(
      "/",
      async (req: Request<{}, {}, SendChatParams>, res: Response) => {
        const { chatService } = getRequestScope(res).cradle;
        const response = await chatService.sendPrompt(req.body);
        res.send(response);
      }
    );
  }
}
