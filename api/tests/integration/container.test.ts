import { container } from "tsyringe";
import { NIL } from "uuid";
import { SFNClient } from "@aws-sdk/client-sfn";
import {
  findImplicitDependencies,
  findInjectableClassNames,
} from "../helpers/dependencyAudit.js";
import {
  allManagedClassNames,
  bootTimeGraph,
  requestScopedGraph,
} from "../helpers/diManagedClasses.js";
import loadGlobalDependencies from "../../src/loaders/loadGlobalDependencies.js";
import { RequestIdToken } from "../../src/middleware/dependencyInjectionMiddleware.js";
import User from "../../src/auth/User.js";
import AuthenticationMiddlewareProvider from "../../src/auth/AuthenticationMiddlewareProvider.js";
import LoggerProvider from "../../src/utils/LoggerProvider.js";
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

describe("registration completeness", () => {
  /**
   * Every dependency must be either explicitly registered by the loader or a
   * DI-managed class of ours. Anything else is being auto-constructed by
   * tsyringe reflection and will throw AwilixResolutionError after the swap.
   *
   * User is excluded deliberately: it is registered into the child container
   * per request by the auth middleware, which is the intended design.
   */
  test("no dependency is resolved implicitly", () => {
    const findings = findImplicitDependencies(
      container,
      { ...bootTimeGraph, ...requestScopedGraph },
      [...Object.values(bootTimeGraph), ...Object.values(requestScopedGraph)],
      [User]
    );

    expect(findings).toEqual([]);
  });

  test("SFNClient is registered explicitly, not reflected into existence", () => {
    expect(container.isRegistered(SFNClient, true)).toBe(true);
  });

  /**
   * Guards the inventory itself. The audit above only walks the classes listed
   * in diManagedClasses.ts, so an @injectable added to src/ without being listed
   * there would never be checked. This fails the build instead.
   */
  test("the DI inventory covers every @injectable class in src/", () => {
    const declared = findInjectableClassNames("src");
    const missing = declared.filter((name) => !allManagedClassNames.has(name));

    expect(declared.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
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
