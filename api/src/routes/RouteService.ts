import { injectable } from "tsyringe";
import { Router } from "express";
import StatusController from "../components/status/StatusController";

@injectable()
export default class RouteService {
  constructor(protected statusController: StatusController) {}

  public registerRoutes() {
    const app = Router();

    this.statusController.registerRoutes(app);

    return app;
  }
}
