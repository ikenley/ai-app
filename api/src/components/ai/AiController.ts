import { type Request, type Response, Router } from "express";
import type { CreatePunParams } from "../../types/index.ts";
import type { ApiCradle } from "../../container/Cradle.ts";
import { getRequestScope } from "../../container/getRequestScope.ts";
import AuthenticationMiddlewareProvider from "../../auth/AuthenticationMiddlewareProvider.ts";

const route = Router();

export default class AiController {
  protected authenticationMiddlewareProvider: AuthenticationMiddlewareProvider;

  constructor({ authenticationMiddlewareProvider }: ApiCradle) {
    this.authenticationMiddlewareProvider = authenticationMiddlewareProvider;
  }

  public registerRoutes(app: Router) {
    app.use("/ai", route);

    route.use(this.authenticationMiddlewareProvider.provide());

    route.post(
      "/pun",
      async (req: Request<{}, {}, CreatePunParams>, res: Response) => {
        const { aiService } = getRequestScope(res).cradle;
        const result = await aiService.createPun(req.body);
        res.send(result);
      },
    );
  }
}
