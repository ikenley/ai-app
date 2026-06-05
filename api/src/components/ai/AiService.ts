import { injectable } from "tsyringe";
import winston from "winston";
import { CreatePunParams, CreatePunResponse } from "../../types/index.js";
import { ConfigOptions } from "../../config/index.js";
import LoggerProvider from "../../utils/LoggerProvider.js";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

@injectable()
export default class AiService {
  private logger: winston.Logger;

  constructor(
    protected loggerProvider: LoggerProvider,
    protected config: ConfigOptions,
    protected bedrockRuntime: BedrockRuntimeClient
  ) {
    this.logger = loggerProvider.provide("AiService");
  }

  public async createPun(params: CreatePunParams) {
    const { prompt } = params;
    this.logger.info("createPun", { prompt });

    const body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Create a pun based on the following words: ${prompt}`,
        },
      ],
    });

    const command = new InvokeModelCommand({
      modelId: "us.anthropic.claude-sonnet-4-6",
      contentType: "application/json",
      accept: "application/json",
      body,
    });

    const result = await this.bedrockRuntime.send(command);
    const parsed = JSON.parse(new TextDecoder().decode(result.body));

    const response: CreatePunResponse = {
      content: parsed.content[0].text,
    };

    return response;
  }
}
