import { DependencyContainer, injectable } from "tsyringe";
import { Response, Router } from "express";
//import { Todo } from "../../types";
import { ConfigOptions } from "../../config";
import AiService from "./AiService";

const route = Router();

@injectable()
export default class AiController {
  constructor(protected config: ConfigOptions) {}

  public registerRoutes(app: Router) {
    app.use("/ai", route);

    const getService = (res: Response) => {
      const container = res.locals.container as DependencyContainer;
      return container.resolve(AiService);
    };

    route.post("/pun", async (_req, res) => {
      const service = getService(res);
      const result = await service.createPun();
      res.send(result);
    });
  }
}
