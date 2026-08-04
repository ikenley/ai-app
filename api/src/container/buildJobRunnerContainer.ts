import {
  type AwilixContainer,
  InjectionMode,
  type Resolver,
  asClass,
  asFunction,
  asValue,
  createContainer,
} from "awilix";
import { NIL } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { SESClient } from "@aws-sdk/client-ses";
import { SQSClient } from "@aws-sdk/client-sqs";
import { GoogleGenAI } from "@google/genai";
import { getConfigOptions } from "../config/index.js";
import LoggerInstance from "../loaders/logger.js";
import User from "../auth/User.js";
import LoggerProvider from "../utils/LoggerProvider.js";
import EmailService from "../services/EmailService.js";
import ImageMetadataRepository from "../components/image/ImageMetadataRepository.js";
import ImageMetadataService from "../components/image/ImageMetadataService.js";
import ImageGeneratorService from "../components/image/ImageGeneratorService.js";
import JobRunnerService from "../components/image/JobRunnerService.js";
import type { JobRunnerCradle } from "./Cradle.js";

/** Every key in JobRunnerCradle must appear below, or this fails to compile. */
type JobRunnerRegistrations = {
  [K in keyof JobRunnerCradle]: Resolver<JobRunnerCradle[K]>;
};

/** The job runner has no authenticated caller, so it carries a placeholder. */
export const JOB_RUNNER_USER_EMAIL = "default@example.net";

/**
 * Builds the root container for the SQS-driven job runner lambda.
 *
 * Everything here is a singleton: the lambda processes one event at a time
 * against a single implicit context, so there is no request scope to create.
 * That is why `requestId` and `user` are concrete values here but throwing
 * placeholders in buildApiContainer — the two entrypoints genuinely differ.
 */
export const buildJobRunnerContainer = (): AwilixContainer<JobRunnerCradle> => {
  const container = createContainer<JobRunnerCradle>({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });

  const registrations: JobRunnerRegistrations = {
    config: asValue(getConfigOptions()),
    logger: asValue(LoggerInstance),

    requestId: asValue(NIL),
    user: asValue(new User(NIL, JOB_RUNNER_USER_EMAIL)),

    genAI: asFunction(
      ({ config }: JobRunnerCradle) =>
        new GoogleGenAI({ apiKey: config.googleGenAI.apiKey })
    ).singleton(),
    dynamoDBClient: asFunction(() => new DynamoDBClient()).singleton(),
    s3Client: asFunction(() => new S3Client()).singleton(),
    sesClient: asFunction(() => new SESClient()).singleton(),
    sqsClient: asFunction(() => new SQSClient()).singleton(),

    loggerProvider: asClass(LoggerProvider).singleton(),
    emailService: asClass(EmailService).singleton(),
    imageMetadataRepository: asClass(ImageMetadataRepository).singleton(),
    imageMetadataService: asClass(ImageMetadataService).singleton(),
    imageGeneratorService: asClass(ImageGeneratorService).singleton(),
    jobRunnerService: asClass(JobRunnerService).singleton(),
  };

  container.register(registrations);
  return container;
};

export default buildJobRunnerContainer;
