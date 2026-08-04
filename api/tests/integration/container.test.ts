import { container } from "tsyringe";
import { NIL } from "uuid";
import loadGlobalDependencies from "../../src/loaders/loadGlobalDependencies.js";
import { RequestIdToken } from "../../src/middleware/dependencyInjectionMiddleware.js";
import User from "../../src/auth/User.js";
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
import StorybookService from "../../src/components/storybook/StorybookService.js";

/**
 * Resolution harness for the API dependency graph.
 *
 * This is the direct precursor to the awilix container validation test in
 * Phase 2 of docs/di-migration.md. Its job is to prove that the same set of
 * classes resolves in the same two scopes before and after the container swap,
 * so a missing registration fails in CI rather than in production.
 *
 * When porting to awilix, keep the two tables below and drive them off the
 * `Cradle` keys instead of importing the classes directly.
 */
const TEST_REQUEST_ID = "11111111-1111-1111-1111-111111111111";

const testUser = new User(
  "00000000-0000-0000-0000-000000000001",
  "authorized@example.com"
);

/** Constructed once at boot, from the root container. */
const bootTimeGraph = {
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
const requestScopedGraph = {
  AiService,
  ChatService,
  EmailService,
  ImageMetadataRepository,
  ImageMetadataService,
  StorybookService,
  LoggerProvider,
};

beforeAll(async () => {
  await loadGlobalDependencies();
});

const buildRequestScope = () => {
  const scope = container.createChildContainer();
  scope.register(RequestIdToken, { useValue: TEST_REQUEST_ID });
  scope.register(User, { useValue: testUser });
  return scope;
};

describe("root container", () => {
  test.each(Object.entries(bootTimeGraph))(
    "resolves %s",
    (_name, ctor: any) => {
      expect(container.resolve(ctor)).toBeInstanceOf(ctor);
    }
  );
});

describe("request-scoped child container", () => {
  test.each(Object.entries(requestScopedGraph))(
    "resolves %s",
    (_name, ctor: any) => {
      expect(buildRequestScope().resolve(ctor)).toBeInstanceOf(ctor);
    }
  );
});

describe("implicit registrations", () => {
  /**
   * StorybookService depends on SFNClient, which is registered in neither
   * loader. tsyringe silently constructs it via `design:paramtypes` reflection.
   * awilix has no such fallback and will throw AwilixResolutionError.
   *
   * Phase 1 registers SFNClient explicitly; this test should keep passing.
   */
  test("StorybookService resolves even though SFNClient is never registered", () => {
    const service = buildRequestScope().resolve(StorybookService);

    expect(service).toBeInstanceOf(StorybookService);
    expect((service as any).sfnClient).toBeDefined();
  });
});

describe("request id propagation (documents a known bug)", () => {
  test("a request-scoped LoggerProvider carries the real request id", () => {
    const loggerProvider = buildRequestScope().resolve(LoggerProvider);

    expect((loggerProvider as any).requestId).toBe(TEST_REQUEST_ID);
  });

  /**
   * KNOWN BUG — do not treat this assertion as desired behaviour.
   *
   * The controller tree is resolved once at boot from the root container, where
   * RequestIdToken is registered as NIL (loadGlobalDependencies.ts). The auth
   * middleware binds its logger in its constructor, so every line it logs
   * carries requestId NIL forever, while services resolved per request get the
   * real id.
   *
   * Phase 4 makes the middleware resolve request-scoped dependencies from the
   * scope inside the handler. When that lands, flip this expectation to
   * TEST_REQUEST_ID and drive it through an actual request.
   */
  test("boot-time auth middleware is stuck with the NIL request id", () => {
    const authProvider = container.resolve(AuthenticationMiddlewareProvider);

    expect((authProvider as any).loggerProvider.requestId).toBe(NIL);
  });
});
