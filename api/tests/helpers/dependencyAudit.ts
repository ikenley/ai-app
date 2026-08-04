import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { DependencyContainer } from "tsyringe";

/**
 * Finds constructor dependencies that tsyringe resolves *implicitly*.
 *
 * tsyringe auto-constructs any unregistered class token by reflecting over
 * `design:paramtypes`, so a dependency that nobody registered still resolves —
 * silently, with whatever a zero-argument constructor produces. awilix has no
 * such fallback and throws AwilixResolutionError instead.
 *
 * This audit exists to find those cases before the container swap, and to keep
 * new ones from creeping in afterwards. See docs/di-migration.md, Phase 1.
 */

/** `@inject(TOKEN)` does not store the bare token — it stores a descriptor,
 *  `{ token, multiple, isOptional }`, and the transform variants nest a further
 *  descriptor under `token`. Unwrap down to the token tsyringe actually
 *  resolves. (tsyringe/dist/cjs/decorators/inject.js) */
const unwrapToken = (value: any): any => {
  let current = value;
  while (current && typeof current === "object" && "token" in current) {
    current = current.token;
  }
  return current;
};

/** Mirrors tsyringe's own parameter resolution: an explicit `@inject(TOKEN)`
 *  overrides the reflected parameter type at that index.
 *  (tsyringe/dist/cjs/reflection-helpers.js) */
export const getConstructorDependencies = (ctor: any): any[] => {
  const paramTypes: any[] =
    Reflect.getMetadata("design:paramtypes", ctor) ?? [];
  const injectionTokens: Record<string, any> =
    Reflect.getOwnMetadata("injectionTokens", ctor) ?? {};

  const dependencies = [...paramTypes];
  for (const index of Object.keys(injectionTokens)) {
    dependencies[+index] = unwrapToken(injectionTokens[index]);
  }
  return dependencies;
};

export const describeToken = (token: any): string => {
  if (typeof token === "function") {
    return token.name || "<anonymous class>";
  }
  return String(token);
};

export type ImplicitDependency = {
  className: string;
  paramIndex: number;
  dependency: string;
};

const collectTsFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectTsFiles(path);
    }
    return entry.name.endsWith(".ts") ? [path] : [];
  });

/**
 * Every class decorated with `@injectable()` anywhere under `src/`.
 *
 * The audit walks a hand-maintained inventory, so without this the inventory
 * could silently fall behind the source tree — a new service would simply never
 * be checked. Comparing the two keeps the tables honest as the graph grows.
 */
export const findInjectableClassNames = (srcDir: string): string[] => {
  const pattern = /@injectable\(\)\s*(?:export\s+)?(?:default\s+)?class\s+(\w+)/g;

  return collectTsFiles(srcDir).flatMap((file) => {
    const source = readFileSync(file, "utf8");
    return [...source.matchAll(pattern)].map((match) => match[1]);
  });
};

/**
 * @param container      the root container, after its loader has run
 * @param graph          the DI-managed classes to walk
 * @param ownClasses     classes the container itself constructs — legitimate to
 *                       leave unregistered, since awilix will bind them with
 *                       `asClass`
 * @param scopeProvided  tokens deliberately registered per request rather than
 *                       at boot (e.g. User, injected by the auth middleware)
 */
export const findImplicitDependencies = (
  container: DependencyContainer,
  graph: Record<string, any>,
  ownClasses: any[],
  scopeProvided: any[] = []
): ImplicitDependency[] => {
  const own = new Set<any>(ownClasses);
  const scoped = new Set<any>(scopeProvided);
  const findings: ImplicitDependency[] = [];

  for (const [className, ctor] of Object.entries(graph)) {
    getConstructorDependencies(ctor).forEach((dependency, paramIndex) => {
      if (dependency === undefined) {
        return;
      }
      if (own.has(dependency) || scoped.has(dependency)) {
        return;
      }
      if (container.isRegistered(dependency, true)) {
        return;
      }
      findings.push({
        className,
        paramIndex,
        dependency: describeToken(dependency),
      });
    });
  }

  return findings;
};
