import { DependencyContainer, injectable } from "tsyringe";
import { Request, Response, Router } from "express";
import { CreatePunParams } from "../../types/index.js";
import { ConfigOptions } from "../../config/index.js";
import AuthenticationMiddlewareProvider from "../../auth/AuthenticationMiddlewareProvider.js";
import AiService from "./AiService.js";

const route = Router();

@injectable()
export default class AiController {
  constructor(
    protected config: ConfigOptions,
    protected authenticationMiddlewareProvider: AuthenticationMiddlewareProvider
  ) {}

  public registerRoutes(app: Router) {
    app.use("/ai", route);

    route.use(this.authenticationMiddlewareProvider.provide());

    const getService = (res: Response) => {
      const container = res.locals.container as DependencyContainer;
      return container.resolve(AiService);
    };

    route.post("/pun", async (req: Request<{}, {}, CreatePunParams>, res) => {
      const service = getService(res);
      const result = await service.createPun(req.body);
      res.send(result);
    });
  }
}
