import { container } from "tsyringe";
import registerJobRunnerDependencies from "../../src/loaders/registerJobRunnerDependencies.js";
import JobRunnerService from "../../src/components/image/JobRunnerService.js";
import ImageGeneratorService from "../../src/components/image/ImageGeneratorService.js";
import ImageMetadataService from "../../src/components/image/ImageMetadataService.js";
import ImageMetadataRepository from "../../src/components/image/ImageMetadataRepository.js";
import EmailService from "../../src/services/EmailService.js";
import LoggerProvider from "../../src/utils/LoggerProvider.js";

/**
 * Resolution harness for the job runner dependency graph.
 *
 * Kept in its own file so it gets a fresh Jest module registry, and therefore a
 * fresh tsyringe root container — registerJobRunnerDependencies and
 * loadGlobalDependencies register overlapping tokens with different values and
 * must not share one. Phase 2 mirrors this split as buildJobRunnerContainer vs
 * buildApiContainer.
 */
const jobRunnerGraph = {
  JobRunnerService,
  ImageGeneratorService,
  ImageMetadataService,
  ImageMetadataRepository,
  EmailService,
  LoggerProvider,
};

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
});
