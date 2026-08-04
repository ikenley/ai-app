import {
  type AwilixContainer,
  InjectionMode,
  type Resolver,
  asClass,
  asFunction,
  asValue,
  createContainer,
} from "awilix";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { BedrockAgentRuntimeClient } from "@aws-sdk/client-bedrock-agent-runtime";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SESClient } from "@aws-sdk/client-ses";
import { SFNClient } from "@aws-sdk/client-sfn";
import { SQSClient } from "@aws-sdk/client-sqs";
import { getConfigOptions } from "../config/index.js";
import LoggerInstance from "../loaders/logger.js";
import LoggerProvider from "../utils/LoggerProvider.js";
import EmailService from "../services/EmailService.js";
import ImageMetadataRepository from "../components/image/ImageMetadataRepository.js";
import ImageMetadataService from "../components/image/ImageMetadataService.js";
import JwtValidationService from "../auth/JwtValidationService.js";
import AuthenticationMiddlewareProvider from "../auth/AuthenticationMiddlewareProvider.js";
import AuthorizationMiddleware from "../auth/AuthorizationMiddleware.js";
import AiService from "../components/ai/AiService.js";
import ChatService from "../components/chat/ChatService.js";
import StorybookService from "../components/storybook/StorybookService.js";
import AiController from "../components/ai/AiController.js";
import ChatController from "../components/chat/ChatController.js";
import ImageController from "../components/image/ImageController.js";
import StatusController from "../components/status/StatusController.js";
import StorybookController from "../components/storybook/StorybookController.js";
import RouteService from "../routes/RouteService.js";
import ExpressLoader from "../loaders/ExpressLoader.js";
import type { ApiCradle } from "./Cradle.js";
import { requestScopedOnly } from "./requestScopedOnly.js";

/** Every key in ApiCradle must appear below, or this fails to compile. */
type ApiRegistrations = { [K in keyof ApiCradle]: Resolver<ApiCradle[K]> };

/**
 * Builds the root container for the HTTP API.
 *
 * Lifetimes are the point of this table. `singleton` is app-lifetime, built
 * once at boot; `scoped` is per request, built against the child scope created
 * by dependencyInjectionMiddleware. With `strict: true`, awilix refuses to let
 * a singleton capture a scoped dependency, which is what previously let the
 * auth middleware freeze a NIL request id into its logger for the life of the
 * process.
 */
export const buildApiContainer = (): AwilixContainer<ApiCradle> => {
  const container = createContainer<ApiCradle>({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });

  const registrations: ApiRegistrations = {
    config: asValue(getConfigOptions()),
    logger: asValue(LoggerInstance),

    // Supplied by the request scope, never by the root container.
    requestId: asFunction(requestScopedOnly("requestId")).scoped(),
    user: asFunction(requestScopedOnly("user")).scoped(),

    jwtVerifier: asFunction(({ config }: ApiCradle) =>
      CognitoJwtVerifier.create({
        userPoolId: config.cognito.userPoolId,
        tokenUse: "id",
        clientId: config.cognito.userPoolClientId,
      })
    ).singleton(),

    bedrockAgentClient: asFunction(
      () => new BedrockAgentRuntimeClient()
    ).singleton(),
    bedrockRuntimeClient: asFunction(
      () => new BedrockRuntimeClient()
    ).singleton(),
    dynamoDBClient: asFunction(() => new DynamoDBClient()).singleton(),
    sesClient: asFunction(() => new SESClient()).singleton(),
    sfnClient: asFunction(() => new SFNClient()).singleton(),
    sqsClient: asFunction(() => new SQSClient()).singleton(),

    // Request-scoped: everything below either reads the request id or the user,
    // directly or through LoggerProvider.
    loggerProvider: asClass(LoggerProvider).scoped(),
    emailService: asClass(EmailService).scoped(),
    imageMetadataRepository: asClass(ImageMetadataRepository).scoped(),
    imageMetadataService: asClass(ImageMetadataService).scoped(),
    jwtValidationService: asClass(JwtValidationService).scoped(),
    aiService: asClass(AiService).scoped(),
    chatService: asClass(ChatService).scoped(),
    storybookService: asClass(StorybookService).scoped(),

    // App-lifetime: these register Express routes once at boot and must pull
    // request-scoped dependencies from res.locals.scope inside their handlers.
    authenticationMiddlewareProvider: asClass(
      AuthenticationMiddlewareProvider
    ).singleton(),
    authorizationMiddleware: asClass(AuthorizationMiddleware).singleton(),
    aiController: asClass(AiController).singleton(),
    chatController: asClass(ChatController).singleton(),
    imageController: asClass(ImageController).singleton(),
    statusController: asClass(StatusController).singleton(),
    storybookController: asClass(StorybookController).singleton(),
    routeService: asClass(RouteService).singleton(),
    expressLoader: asClass(ExpressLoader).singleton(),
  };

  container.register(registrations);
  return container;
};

export default buildApiContainer;
