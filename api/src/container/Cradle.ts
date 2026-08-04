import type winston from "winston";
import type { CognitoJwtVerifier } from "aws-jwt-verify";
import type { BedrockAgentRuntimeClient } from "@aws-sdk/client-bedrock-agent-runtime";
import type { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import type { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import type { S3Client } from "@aws-sdk/client-s3";
import type { SESClient } from "@aws-sdk/client-ses";
import type { SFNClient } from "@aws-sdk/client-sfn";
import type { SQSClient } from "@aws-sdk/client-sqs";
import type { GoogleGenAI } from "@google/genai";
import type { ConfigOptions } from "../config/index.js";
import type User from "../auth/User.js";
import type LoggerProvider from "../utils/LoggerProvider.js";
import type EmailService from "../services/EmailService.js";
import type ImageMetadataRepository from "../components/image/ImageMetadataRepository.js";
import type ImageMetadataService from "../components/image/ImageMetadataService.js";
import type ImageGeneratorService from "../components/image/ImageGeneratorService.js";
import type JobRunnerService from "../components/image/JobRunnerService.js";
import type JwtValidationService from "../auth/JwtValidationService.js";
import type AuthenticationMiddlewareProvider from "../auth/AuthenticationMiddlewareProvider.js";
import type AuthorizationMiddleware from "../auth/AuthorizationMiddleware.js";
import type AiService from "../components/ai/AiService.js";
import type ChatService from "../components/chat/ChatService.js";
import type StorybookService from "../components/storybook/StorybookService.js";
import type AiController from "../components/ai/AiController.js";
import type ChatController from "../components/chat/ChatController.js";
import type ImageController from "../components/image/ImageController.js";
import type StatusController from "../components/status/StatusController.js";
import type StorybookController from "../components/storybook/StorybookController.js";
import type RouteService from "../routes/RouteService.js";
import type ExpressLoader from "../loaders/ExpressLoader.js";

/**
 * The dependency injection cradle.
 *
 * With `InjectionMode.PROXY`, awilix hands each constructor a single object
 * whose properties are the registered dependencies, resolved lazily on access.
 * These interfaces are the contract for that object: a class declares the keys
 * it needs by destructuring, and the container's registration table is typed
 * against the same interface, so a missing registration is a compile error
 * rather than a runtime one.
 *
 * The split into three reflects the two entrypoints. The API lambda and the job
 * runner lambda build different graphs, and a class shared by both should depend
 * only on `CoreCradle` so it can be constructed by either.
 */

/** Available in every container. Classes used by both entrypoints take this. */
export interface CoreCradle {
  config: ConfigOptions;
  logger: winston.Logger;

  /** Request-scoped. Only a scope can supply this — see buildApiContainer. */
  requestId: string;
  /** Request-scoped. Registered by the authentication middleware. */
  user: User;

  dynamoDBClient: DynamoDBClient;
  sesClient: SESClient;
  sqsClient: SQSClient;

  loggerProvider: LoggerProvider;
  emailService: EmailService;
  imageMetadataRepository: ImageMetadataRepository;
  imageMetadataService: ImageMetadataService;
}

/** The HTTP API graph: auth, controllers, and the Express wiring. */
export interface ApiCradle extends CoreCradle {
  jwtVerifier: CognitoJwtVerifier<any, any, any>;
  bedrockAgentClient: BedrockAgentRuntimeClient;
  bedrockRuntimeClient: BedrockRuntimeClient;
  sfnClient: SFNClient;

  jwtValidationService: JwtValidationService;
  authenticationMiddlewareProvider: AuthenticationMiddlewareProvider;
  authorizationMiddleware: AuthorizationMiddleware;

  aiService: AiService;
  chatService: ChatService;
  storybookService: StorybookService;

  aiController: AiController;
  chatController: ChatController;
  imageController: ImageController;
  statusController: StatusController;
  storybookController: StorybookController;

  routeService: RouteService;
  expressLoader: ExpressLoader;
}

/** The SQS-driven image generation graph. No HTTP request, so no request scope. */
export interface JobRunnerCradle extends CoreCradle {
  genAI: GoogleGenAI;
  s3Client: S3Client;

  imageGeneratorService: ImageGeneratorService;
  jobRunnerService: JobRunnerService;
}
