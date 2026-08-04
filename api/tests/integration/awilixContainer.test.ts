import { asFunction, asValue } from "awilix";
import { NIL } from "uuid";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { SFNClient } from "@aws-sdk/client-sfn";
import { GoogleGenAI } from "@google/genai";
import buildApiContainer from "../../src/container/buildApiContainer.js";
import buildJobRunnerContainer, {
  JOB_RUNNER_USER_EMAIL,
} from "../../src/container/buildJobRunnerContainer.js";
import type { ApiCradle } from "../../src/container/Cradle.js";
import User from "../../src/auth/User.js";

/**
 * Validation harness for the awilix containers (Phase 2 of docs/di-migration.md).
 *
 * Registration *completeness* is enforced at compile time: the registration
 * tables are typed as `{ [K in keyof Cradle]: Resolver<...> }`, so a missing key
 * is a build error, not something a test has to catch. What is left for runtime
 * is that the values resolve, that the lifetimes are what we intended, and that
 * the request-scoped keys fail loudly outside a request.
 *
 * The classes still have tsyringe-shaped positional constructors, so `asClass`
 * resolution cannot work until Phase 3 rewrites them. That block is skipped
 * below rather than omitted, so enabling it is the visible last step of Phase 3.
 */
const TEST_REQUEST_ID = "11111111-1111-1111-1111-111111111111";

const testUser = new User(
  "00000000-0000-0000-0000-000000000001",
  "authorized@example.com"
);

const API_KEYS = [
  "aiController",
  "aiService",
  "authenticationMiddlewareProvider",
  "authorizationMiddleware",
  "bedrockAgentClient",
  "bedrockRuntimeClient",
  "chatController",
  "chatService",
  "config",
  "dynamoDBClient",
  "emailService",
  "expressLoader",
  "imageController",
  "imageMetadataRepository",
  "imageMetadataService",
  "jwtValidationService",
  "jwtVerifier",
  "logger",
  "loggerProvider",
  "requestId",
  "routeService",
  "sesClient",
  "sfnClient",
  "sqsClient",
  "statusController",
  "storybookController",
  "storybookService",
  "user",
];

const JOB_RUNNER_KEYS = [
  "config",
  "dynamoDBClient",
  "emailService",
  "genAI",
  "imageGeneratorService",
  "imageMetadataRepository",
  "imageMetadataService",
  "jobRunnerService",
  "logger",
  "loggerProvider",
  "requestId",
  "s3Client",
  "sesClient",
  "sqsClient",
  "user",
];

describe("API container", () => {
  test("builds without resolving anything eagerly", () => {
    expect(() => buildApiContainer()).not.toThrow();
  });

  test("registers exactly the expected keys", () => {
    const container = buildApiContainer();

    expect(Object.keys(container.registrations).sort()).toEqual(API_KEYS);
  });

  test("resolves the leaf values", () => {
    const { cradle } = buildApiContainer();

    expect(cradle.config.app.name).toBe("ai-api-test");
    expect(cradle.logger).toBeDefined();
    expect(cradle.sfnClient).toBeInstanceOf(SFNClient);
    expect(cradle.jwtVerifier).toBeInstanceOf(CognitoJwtVerifier);
  });

  test("treats singletons as shared across scopes", () => {
    const container = buildApiContainer();
    const first = container.createScope();
    const second = container.createScope();

    expect(first.cradle.sqsClient).toBe(second.cradle.sqsClient);
  });

  describe("request-scoped keys", () => {
    test.each(["requestId", "user"])(
      "%s throws a named error when resolved from the root",
      (key) => {
        const container = buildApiContainer();

        expect(() => (container.cradle as any)[key]).toThrow(
          /is request-scoped/
        );
      }
    );

    test("resolve once the scope supplies them", () => {
      const scope = buildApiContainer().createScope();
      scope.register({
        requestId: asValue(TEST_REQUEST_ID),
        user: asValue(testUser),
      });

      expect(scope.cradle.requestId).toBe(TEST_REQUEST_ID);
      expect(scope.cradle.user.email).toBe("authorized@example.com");
    });
  });

  /**
   * The reason this migration uses awilix rather than hand-written wiring: a
   * singleton that captures a request-scoped value is the exact shape of the
   * bug that froze a NIL request id into the auth middleware's logger.
   */
  test("strict mode rejects a singleton that captures a request-scoped dependency", () => {
    const container = buildApiContainer();
    container.register({
      leaky: asFunction(({ requestId }: ApiCradle) => requestId).singleton(),
    } as any);

    const scope = container.createScope();
    scope.register({ requestId: asValue(TEST_REQUEST_ID) });

    expect(() => (scope.cradle as any).leaky).toThrow(
      /has a shorter lifetime than its ancestor/
    );
  });

  /** The same wiring, correctly scoped, must still resolve — otherwise the test
   *  above would pass for the wrong reason. */
  test("a scoped consumer of a request-scoped dependency resolves normally", () => {
    const container = buildApiContainer();
    container.register({
      wellBehaved: asFunction(({ requestId }: ApiCradle) => requestId).scoped(),
    } as any);

    const scope = container.createScope();
    scope.register({ requestId: asValue(TEST_REQUEST_ID) });

    expect((scope.cradle as any).wellBehaved).toBe(TEST_REQUEST_ID);
  });
});

describe("job runner container", () => {
  test("builds without resolving anything eagerly", () => {
    expect(() => buildJobRunnerContainer()).not.toThrow();
  });

  test("registers exactly the expected keys", () => {
    const container = buildJobRunnerContainer();

    expect(Object.keys(container.registrations).sort()).toEqual(
      JOB_RUNNER_KEYS
    );
  });

  test("resolves the leaf values", () => {
    const { cradle } = buildJobRunnerContainer();

    expect(cradle.config.app.name).toBe("ai-api-test");
    expect(cradle.genAI).toBeInstanceOf(GoogleGenAI);
  });

  /** Unlike the API, this container has a single implicit context, so both
   *  request-scoped keys carry concrete placeholder values. */
  test("supplies a placeholder request id and user", () => {
    const { cradle } = buildJobRunnerContainer();

    expect(cradle.requestId).toBe(NIL);
    expect(cradle.user.email).toBe(JOB_RUNNER_USER_EMAIL);
  });
});

/**
 * Phase 3 rewrites every constructor to destructure the cradle. Until then
 * `asClass` hands the cradle in as the first positional argument, which the
 * tsyringe-shaped constructors misread. Remove `.skip` as the final step of
 * Phase 3 — these should then pass without further changes.
 */
describe.skip("class resolution (enable in Phase 3)", () => {
  test("the API graph resolves from a request scope", () => {
    const scope = buildApiContainer().createScope();
    scope.register({
      requestId: asValue(TEST_REQUEST_ID),
      user: asValue(testUser),
    });

    expect(scope.cradle.chatService).toBeDefined();
    expect(scope.cradle.imageMetadataService).toBeDefined();
    expect(scope.cradle.expressLoader).toBeDefined();
  });

  test("the job runner graph resolves from the root", () => {
    const { cradle } = buildJobRunnerContainer();

    expect(cradle.jobRunnerService).toBeDefined();
  });
});
