import { injectable } from "tsyringe";
import { Router } from "express";
import AiController from "../components/ai/AiController.js";
import ChatController from "../components/chat/ChatController.js";
import ImageController from "../components/image/ImageController.js";
import StatusController from "../components/status/StatusController.js";
import StorybookController from "../components/storybook/StorybookController.js";

@injectable()
export default class RouteService {
  constructor(
    protected aiController: AiController,
    protected chatController: ChatController,
    protected imageController: ImageController,
    protected statusController: StatusController,
    protected storybookController: StorybookController
  ) {}

  public registerRoutes() {
    const app = Router();

    this.aiController.registerRoutes(app);
    this.chatController.registerRoutes(app);
    this.imageController.registerRoutes(app);
    this.statusController.registerRoutes(app);
    this.storybookController.registerRoutes(app);

    return app;
  }
}
