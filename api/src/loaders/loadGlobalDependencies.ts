import { container } from "tsyringe";
import { NIL } from "uuid";
import OpenAI from "openai";
import { SESClient } from "@aws-sdk/client-ses";
import CognitoExpress from "cognito-express";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SQSClient } from "@aws-sdk/client-sqs";
import { BedrockAgentRuntimeClient } from "@aws-sdk/client-bedrock-agent-runtime";
import { ConfigOptions, getConfigOptions } from "../config";
import LoggerInstance, { LoggerToken } from "./logger";
import { CognitoExpressToken } from "../types";
import { RequestIdToken } from "../middleware/dependencyInjectionMiddleware";

export default () => {
  try {
    const config = getConfigOptions();
    container.register(ConfigOptions, { useValue: config });

    container.register(LoggerToken, { useValue: LoggerInstance });

    // Register default request Id.
    // This will be replaced by request-level dependency container in most cases
    container.register(RequestIdToken, { useValue: NIL });

    const cognitoExpress = new CognitoExpress({
      region: config.aws.region,
      cognitoUserPoolId: config.cognito.userPoolId,
      tokenUse: "id",
      tokenExpiration: 3600000,
    });
    container.register(CognitoExpressToken, { useValue: cognitoExpress });

    const bedrockAgentClient = new BedrockAgentRuntimeClient() as any;
    container.register(BedrockAgentRuntimeClient, {
      useValue: bedrockAgentClient,
    });

    const dynamoDBClient = new DynamoDBClient() as any;
    container.register(DynamoDBClient, { useValue: dynamoDBClient });

    const sesClient = new SESClient() as any;
    container.register(SESClient, { useValue: sesClient });

    const sqsClient = new SQSClient() as any;
    container.register(SQSClient, { useValue: sqsClient });

    const openai = new OpenAI(); // uses OPENAI_API_KEY env var
    container.register(OpenAI, { useValue: openai });
  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
