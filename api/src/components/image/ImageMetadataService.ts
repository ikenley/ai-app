import { injectable } from "tsyringe";
import winston from "winston";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import LoggerProvider from "../../utils/LoggerProvider";
import { RequestImageParams } from "../../types";
import { ConfigOptions } from "../../config";
import { v4 as uuidv4 } from "uuid";
import User from "../../auth/User";
import CreateImageMessage from "./CreateImageMessage";

@injectable()
export default class ImageMetadataService {
  private logger: winston.Logger;

  constructor(
    protected loggerProvider: LoggerProvider,
    protected config: ConfigOptions,
    protected sqsClient: SQSClient,
    protected user: User
  ) {
    this.logger = loggerProvider.provide("ImageMetadataService");
  }

  /** Submit an image request to the job queue */
  public async publishImageRequest(params: RequestImageParams) {
    const { prompt } = params;

    const message: CreateImageMessage = {
      imageId: uuidv4(),
      prompt: prompt,
      userId: this.user.id,
      email: this.user.email,
    };
    this.logger.info("publishImageRequest", { message });

    const command = new SendMessageCommand({
      QueueUrl: this.config.jobQueueUrl,
      DelaySeconds: 10,
      MessageBody: JSON.stringify(message),
    });

    await this.sqsClient.send(command);
  }
}
