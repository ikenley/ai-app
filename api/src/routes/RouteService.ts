import { Router } from "express";
import type { ApiCradle } from "../container/Cradle.ts";
import AiController from "../components/ai/AiController.ts";
import ChatController from "../components/chat/ChatController.ts";
import ImageController from "../components/image/ImageController.ts";
import StatusController from "../components/status/StatusController.ts";
import StorybookController from "../components/storybook/StorybookController.ts";

export default class RouteService {
  protected aiController: AiController;
  protected chatController: ChatController;
  protected imageController: ImageController;
  protected statusController: StatusController;
  protected storybookController: StorybookController;

  constructor({
    aiController,
    chatController,
    imageController,
    statusController,
    storybookController,
  }: ApiCradle) {
    this.aiController = aiController;
    this.chatController = chatController;
    this.imageController = imageController;
    this.statusController = statusController;
    this.storybookController = storybookController;
  }

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
