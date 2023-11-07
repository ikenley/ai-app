import { injectable } from "tsyringe";
import winston from "winston";
import { ConfigOptions } from "../../config";
import LoggerProvider from "../../utils/LoggerProvider";

@injectable()
export default class AiService {
  private logger: winston.Logger;

  constructor(
    protected loggerProvider: LoggerProvider,
    protected config: ConfigOptions
  ) {
    this.logger = loggerProvider.provide("AiService");
  }

  public async createPun() {
    this.logger.info("createPun");

    return "TODO";
  }
}
