import { container } from "tsyringe";
import { NIL } from "uuid";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";
import LoggerInstance from "./logger";
import { ConfigOptions, getConfigOptions } from "../config";
import { LoggerToken } from "./logger";
import { RequestIdToken } from "../middleware/dependencyInjectionMiddleware";

/** Register dependencies for Job Runner service */
export default () => {
  try {
    const config = getConfigOptions();
    container.register(ConfigOptions, { useValue: config });

    container.register(LoggerToken, { useValue: LoggerInstance });

    // Register default request Id.
    // This will be replaced by request-level dependency container in most cases
    container.register(RequestIdToken, { useValue: NIL });

    const bedrockClient = new BedrockRuntimeClient() as any;
    container.register(BedrockRuntimeClient, { useValue: bedrockClient });

    const s3Client = new S3Client() as any;
    container.register(S3Client, { useValue: s3Client });

    const sesClient = new SESClient() as any;
    container.register(SESClient, { useValue: sesClient });
  } catch (e) {
    LoggerInstance.error("🔥 Error on dependency injector loader: %o", e);
    throw e;
  }
};
