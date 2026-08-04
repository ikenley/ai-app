import { Request, Response, Router } from "express";
import { CreatePunParams } from "../../types/index.js";
import type { ApiCradle } from "../../container/Cradle.js";
import { getRequestScope } from "../../container/getRequestScope.js";
import AuthenticationMiddlewareProvider from "../../auth/AuthenticationMiddlewareProvider.js";

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
      }
    );
  }
}
