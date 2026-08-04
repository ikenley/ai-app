# Migrating `/api` from tsyringe to awilix

Status: **proposed, not started**
Last updated: 2026-08-04

## Why

Two goals drive this:

1. **Run TypeScript directly on Node 24+**, dropping `ts-node`, and typecheck separately via
   `tsc --noEmit`.
2. **Keep the DI story viable long-term.** This repo is used as a base template that gets forked
   into projects with larger dependency graphs, so the wiring layer needs to stay legible as it
   grows.

`tsyringe` blocks goal 1 outright, and the reasons are permanent rather than
version-lag:

- **Node cannot parse decorators at all.** On Node 25.6.1, `@injectable()` throws
  `SyntaxError: Invalid or unexpected token` in *both* strip-only mode and under
  `--experimental-transform-types`. This is not a missing flag — V8 has not shipped decorators, so
  the type-stripper has nothing to strip them down to.
- **`emitDecoratorMetadata` can never come back.** tsyringe auto-wires constructors by reading the
  `design:paramtypes` metadata that only `tsc` emits. No runtime provides it, and TC39 standard
  decorators do not decorate constructor *parameters* at all — so even once V8 ships decorators,
  tsyringe's core mechanism has no forward path.
- **Parameter properties** (`constructor(protected foo: Bar)`) are a separate blocker. Strip-only
  mode rejects them with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`; they require
  `--experimental-transform-types`.

What is *not* a problem: **TypeScript 7 still emits `design:paramtypes` correctly.** Verified
against 7.0.2 — the dependabot bump in `7dc2703` does not break tsyringe. `tsc --noEmit` for
typechecking is independent of all of the above.

## Target

awilix 13.0.5, `InjectionMode.PROXY`, `strict: true`. 21 classes, 2 lifetimes.

**Why `strict: true` matters here.** awilix's strict mode performs lifetime-leakage detection — a
`SINGLETON` resolving a `SCOPED` dependency throws instead of silently capturing a stale value
(`awilix/lib/container.js:310`, `isLeakSafe`). That is exactly the guard that would have caught the
`requestId: NIL` bug described below, and it is the strongest argument for a container over
hand-written wiring in a template that other people extend.

**Why PROXY mode and not CLASSIC.** CLASSIC mode would let us skip the constructor rewrites
entirely — it resolves by parameter *name*, and our names already match the registration keys. Do
not do this. It works by `Function.prototype.toString()` parsing, which would put DI correctness at
the mercy of whatever transform is stripping our types — the exact moving part this migration is
trying to modernize.

**Useful side effect.** PROXY mode replaces every parameter-property constructor with a destructured
object plus explicit field assignment. There are no enums or namespaces anywhere in `src/`, so once
that rewrite is done, **strip-only mode works** and `--experimental-transform-types` is unnecessary.
The DI migration and the native-TypeScript goal turn out to be the same piece of work.

## Findings that shape the plan

These were confirmed against the current tree and are the reason for the phase ordering.

### 1. There is effectively no test coverage

`npm test` is red today. `tests/integration/components/status/statusController.test.ts` is leftover
boilerplate that imports `typeorm` (not a dependency) and calls `require()` inside an ESM module —
it cannot run. Only `tests/unit/dummy.test.ts` passes: 2 tests total, neither touching DI.

### 2. Request-scoped logging is silently broken

`LoggerProvider` depends on `RequestIdToken`, which makes it transitively request-scoped — and so is
everything depending on it. But the controller tree is resolved once at boot from the *root*
container (`container.resolve(ExpressLoader)` in `src/index.ts:17`), where `RequestIdToken` is
registered as `NIL` (`src/loaders/loadGlobalDependencies.ts:24`).

`AuthenticationMiddlewareProvider` captures `loggerProvider.provide(...)` into `this.logger` at
construction time, so every "Invalid jwt" log line at
`src/auth/AuthenticationMiddlewareProvider.ts:49` carries `requestId: NIL`, permanently. Same for
`AuthorizationMiddleware`. Services resolve per-request via `res.locals.container` and get the real
ID; middleware never does.

The `NIL` default registration is what turns a wiring error into silently wrong log lines. Fixed in
Phase 4.

### 3. Some dependencies are never registered

tsyringe auto-constructs unregistered *class* tokens via `design:paramtypes` reflection. awilix has
no such fallback and throws `AwilixResolutionError`.

- **`SFNClient`** — required by `StorybookService.ts:19`, registered in *neither*
  `loadGlobalDependencies.ts` nor `registerJobRunnerDependencies.ts`. It works today only because
  tsyringe silently does `new SFNClient()`.
- **`User`** — registered per-request by the auth middleware only. On any path resolving a
  user-dependent service before authentication, tsyringe silently constructs
  `new User(undefined, undefined)` rather than throwing.

Losing auto-registration is a feature, but the migration has to account for it.

---

## Phase 0 — Safety net (BLOCKING, ~½ day)

Nothing protects this migration today. Do not start Phase 1 until all of the following are done:

1. Delete the dead `statusController.test.ts`.
2. Write a real integration test that boots Express through `ExpressLoader` and asserts `/status`
   returns 200, plus one authenticated route with a stubbed `CognitoJwtVerifier`. This is the
   characterization test — it must pass on tsyringe *before* the migration and again after.
3. Add the container validation test (Phase 2).
4. Gate: `npm test` green.

Skipping this phase is the main way this migration goes wrong.

## Phase 1 — Make implicit registrations explicit (~1 hr, still on tsyringe)

Audit every constructor parameter type against the two register lists and add explicit
`container.register(...)` calls for the gaps — starting with `SFNClient` (see Finding 3).

Land this as a **separate, behavior-neutral commit on tsyringe** so the risky change stays isolated
and bisectable.

## Phase 2 — Add the container module (~1 hr, no consumers yet)

```
src/container/Cradle.ts              // the interface — single source of truth
src/container/buildApiContainer.ts   // replaces loadGlobalDependencies.ts
src/container/buildJobRunnerContainer.ts
```

```ts
export interface Cradle {
  config: ConfigOptions;
  logger: winston.Logger;
  requestId: string;          // scope-only
  user: User;                 // scope-only
  sfnClient: SFNClient;       // ...and the rest of the SDK clients
  loggerProvider: LoggerProvider;
  chatService: ChatService;
  // ... 21 entries
}

export const buildApiContainer = () => {
  const config = getConfigOptions();
  const c = createContainer<Cradle>({ injectionMode: InjectionMode.PROXY, strict: true });
  c.register({
    config: asValue(config),
    logger: asValue(LoggerInstance),
    sfnClient: asFunction(() => new SFNClient()).singleton(),
    loggerProvider: asClass(LoggerProvider).scoped(),
    chatService: asClass(ChatService).scoped(),
    aiController: asClass(AiController).singleton(),
    // ...
  });
  return c;
};
```

Register explicitly rather than using `loadModules` — for a template, an explicit table is the
documentation.

**The container validation test** is the highest-value artifact here. Iterate every `Cradle` key and
resolve it, once in root scope and once in a request scope seeded with `requestId` and `user`. Any
dependency a future fork adds without registering fails in CI instead of production, and the test
doubles as executable documentation of which keys are scope-only.

## Phase 3 — Convert the classes (~4–6 hrs)

19 injectables, plus `User.ts` and `SsmParamLoader.ts` (both hold parameter properties but are not
DI-managed). Per class: drop `@injectable`/`@inject`, declare fields explicitly, destructure the
cradle.

```ts
export default class ChatService {
  private logger: winston.Logger;
  protected config: ConfigOptions;
  protected user: User;
  protected bedrockAgentClient: BedrockAgentRuntimeClient;
  protected emailService: EmailService;

  constructor({ loggerProvider, config, user, bedrockAgentClient, emailService }: Cradle) {
    this.config = config;
    this.user = user;
    this.bedrockAgentClient = bedrockAgentClient;
    this.emailService = emailService;
    this.logger = loggerProvider.provide("ChatService");
  }
}
```

Method bodies are untouched — `this.config` still resolves. The field-declaration boilerplate is the
honest price of a container over hand-written wiring.

Convert leaf-first: `LoggerProvider` → `EmailService`/repositories → services → middleware →
controllers → `RouteService` → `ExpressLoader`. At this size, do not try to run both containers in
parallel; work on a branch and flip at the end.

> `npm run build` will fail partway through this phase while the graph is half-wired. That is
> expected. The Phase 0 characterization test is what tells you whether you landed correctly, not
> intermediate builds.

## Phase 4 — Fix the lifetime bug (~2 hrs)

The design change, and the main reason to migrate rather than stay put.

Controllers and middleware are boot-time route registrars — genuinely app-lifetime — so register
them `.singleton()`. Everything request-touching is `.scoped()`. With `strict: true`, a singleton
holding a scoped dep now throws at resolve time, so this cannot silently regress.

That means `AuthenticationMiddlewareProvider` and `AuthorizationMiddleware` stop binding a logger in
their constructors and instead pull request-scoped deps from the scope inside the handler, mirroring
the `getService(res)` pattern the controllers already use:

```ts
public provide() {
  return async (req, res, next) => {
    const scope = res.locals.scope as AwilixContainer<Cradle>;
    const logger = scope.cradle.loggerProvider.provide("AuthMiddlewareProvider");
    const user = await scope.cradle.jwtValidationService.validate(authHeader);
    scope.register({ user: asValue(user) });
    next();
  };
}
```

`dependencyInjectionMiddleware` becomes `container.createScope()` plus
`scope.register({ requestId: asValue(uuidv4()) })`.

Drop the `RequestIdToken: NIL` root default — that registration is what converted a wiring error
into silently wrong log lines.

## Phase 5 — Flip entrypoints (~1 hr)

`index.ts`, `index-api-lambda.ts`, `index-job-runner.ts`, `test-job-runner.ts`,
`test-api-lambda.ts`. Remove `import "reflect-metadata"` from every file carrying it.

Re-run the Phase 0 characterization test — it should pass unchanged.

## Phase 6 — Remove tsyringe (~30 min)

- Drop `tsyringe` and `reflect-metadata` from `package.json`
- Remove `experimentalDecorators` and `emitDecoratorMetadata` from `tsconfig.json`

No decorators and no parameter properties remain in the tree.

## Phase 7 — Native TypeScript, the original goal (~1–2 hrs)

Now unblocked, in strip-only mode (no `--experimental-transform-types` needed):

- `nodemon.json` `exec` → `node --watch src/index.ts` (nodemon becomes optional)
- The four `ts-node` scripts (`cli`, `run-job-runner`, `test-api-lambda`, `test-job-runner`) → plain
  `node src/*.ts`
- Add `"typecheck": "tsc --noEmit"`
- Drop `ts-node` from devDependencies and the `ts-node` block from `tsconfig.json`

Keep the `tsc` build for Docker/Lambda artifacts — a real build step is still wanted for deploys.
Jest stays on `ts-jest`; moving it to `node --test` is a separate decision.

---

## Effort

~1.5–2 days total. Phase 3 is the bulk; Phase 0 is non-negotiable. Phases 1 and 6 are independently
revertable checkpoints.

## Alternative considered: hand-written composition root

No library — a `buildRootDeps()` returning singletons plus a `createRequestScope(requestId, user)`
factory. Roughly a wash on line count, requires **no** constructor changes (positional args stay as
they are), and removes a dependency.

Rejected for this repo specifically because it is a fork-and-grow template: `.singleton()` vs
`.scoped()` in a registration table carries the scoping rules better than "remember to add your new
class to the right factory function," and strict mode enforces them mechanically. That property is
worth more in a template than in an application.

Worth noting that the decision is reversible in both directions — the conversion either way is
mechanical and linear in class count, so this is lower-stakes than it looks. If a fork stays small,
hand-wiring remains a reasonable retreat.
