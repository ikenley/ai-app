import ExpressLoader from "../../src/loaders/ExpressLoader.js";
import RouteService from "../../src/routes/RouteService.js";
import AiController from "../../src/components/ai/AiController.js";
import ChatController from "../../src/components/chat/ChatController.js";
import ImageController from "../../src/components/image/ImageController.js";
import StatusController from "../../src/components/status/StatusController.js";
import StorybookController from "../../src/components/storybook/StorybookController.js";
import AuthenticationMiddlewareProvider from "../../src/auth/AuthenticationMiddlewareProvider.js";
import AuthorizationMiddleware from "../../src/auth/AuthorizationMiddleware.js";
import JwtValidationService from "../../src/auth/JwtValidationService.js";
import LoggerProvider from "../../src/utils/LoggerProvider.js";
import AiService from "../../src/components/ai/AiService.js";
import ChatService from "../../src/components/chat/ChatService.js";
import EmailService from "../../src/services/EmailService.js";
import ImageMetadataRepository from "../../src/components/image/ImageMetadataRepository.js";
import ImageMetadataService from "../../src/components/image/ImageMetadataService.js";
import ImageGeneratorService from "../../src/components/image/ImageGeneratorService.js";
import JobRunnerService from "../../src/components/image/JobRunnerService.js";
import StorybookService from "../../src/components/storybook/StorybookService.js";

/**
 * The DI-managed classes, grouped by the scope that constructs them.
 *
 * These tables drive the resolution and registration-audit tests, and they are
 * the inventory Phase 2 turns into `Cradle` keys. `coversEveryInjectable` in
 * dependencyAudit.ts asserts that they stay in step with the source tree, so
 * adding an @injectable class without listing it here fails the build.
 */

/** Constructed once at boot, from the root API container. */
export const bootTimeGraph = {
  ExpressLoader,
  RouteService,
  AiController,
  ChatController,
  ImageController,
  StatusController,
  StorybookController,
  AuthenticationMiddlewareProvider,
  AuthorizationMiddleware,
  JwtValidationService,
  LoggerProvider,
};

/** Constructed per request, from the child container. */
export const requestScopedGraph = {
  AiService,
  ChatService,
  EmailService,
  ImageMetadataRepository,
  ImageMetadataService,
  StorybookService,
  LoggerProvider,
};

/** Constructed by the job runner lambda, which has no HTTP request scope. */
export const jobRunnerGraph = {
  JobRunnerService,
  ImageGeneratorService,
  ImageMetadataService,
  ImageMetadataRepository,
  EmailService,
  LoggerProvider,
};

/**
 * Keyed on the runtime class name rather than the table key above, because a
 * default export's import binding is arbitrary and the two can drift — e.g.
 * src/auth/AuthenticationMiddlewareProvider.ts declares
 * `export default class AuthMiddlewareProvider`.
 */
export const allManagedClassNames = new Set(
  [
    ...Object.values(bootTimeGraph),
    ...Object.values(requestScopedGraph),
    ...Object.values(jobRunnerGraph),
  ].map((ctor) => ctor.name)
);
