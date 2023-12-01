import { injectable } from "tsyringe";
import { Router } from "express";
import AiController from "../components/ai/AiController";
import ImageController from "../components/image/ImageController";
import StatusController from "../components/status/StatusController";

@injectable()
export default class RouteService {
  constructor(
    protected aiController: AiController,
    protected imageController: ImageController,
    protected statusController: StatusController
  ) {}

  public registerRoutes() {
    const app = Router();

    this.aiController.registerRoutes(app);
    this.imageController.registerRoutes(app);
    this.statusController.registerRoutes(app);

    return app;
  }
}
