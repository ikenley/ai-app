import { type Request, type Response, Router } from "express";
import type { SendChatParams } from "../../types/index.ts";
import type { ApiCradle } from "../../container/Cradle.ts";
import { getRequestScope } from "../../container/getRequestScope.ts";
import type AuthenticationMiddlewareProvider from "../../auth/AuthenticationMiddlewareProvider.ts";
import type AuthorizationMiddleware from "../../auth/AuthorizationMiddleware.ts";

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
      async (req: Request<unknown, unknown, SendChatParams>, res: Response) => {
        const { chatService } = getRequestScope(res).cradle;
        const response = await chatService.sendPrompt(req.body);
        res.send(response);
      },
    );
  }
}
