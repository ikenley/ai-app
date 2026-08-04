import { container } from "tsyringe";
import { findImplicitDependencies } from "../helpers/dependencyAudit.js";
import { jobRunnerGraph } from "../helpers/diManagedClasses.js";
import registerJobRunnerDependencies from "../../src/loaders/registerJobRunnerDependencies.js";
import ImageMetadataService from "../../src/components/image/ImageMetadataService.js";

/**
 * Resolution harness for the job runner dependency graph.
 *
 * Kept in its own file so it gets a fresh Jest module registry, and therefore a
 * fresh tsyringe root container — registerJobRunnerDependencies and
 * loadGlobalDependencies register overlapping tokens with different values and
 * must not share one. Phase 2 mirrors this split as buildJobRunnerContainer vs
 * buildApiContainer.
 */
beforeAll(async () => {
  await registerJobRunnerDependencies();
});

describe("job runner container", () => {
  test.each(Object.entries(jobRunnerGraph))("resolves %s", (_name, ctor: any) => {
    expect(container.resolve(ctor)).toBeInstanceOf(ctor);
  });

  /**
   * The job runner has no HTTP request to carry a User, so the loader registers
   * a placeholder. Phase 2 should keep this explicit rather than letting the
   * container invent one.
   */
  test("registers a placeholder User for the unauthenticated job context", () => {
    const service = container.resolve(ImageMetadataService);

    expect((service as any).user.email).toBe("default@example.net");
  });

  /**
   * Unlike the API container, the job runner registers User itself, so nothing
   * is expected to be scope-provided here. See tests/helpers/dependencyAudit.ts.
   */
  test("no dependency is resolved implicitly", () => {
    const findings = findImplicitDependencies(
      container,
      jobRunnerGraph,
      Object.values(jobRunnerGraph)
    );

    expect(findings).toEqual([]);
  });
});
