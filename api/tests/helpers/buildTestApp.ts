import express from "express";
import { container } from "tsyringe";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SQSClient } from "@aws-sdk/client-sqs";
import loadGlobalDependencies from "../../src/loaders/loadGlobalDependencies.js";
import ExpressLoader from "../../src/loaders/ExpressLoader.js";
import { CognitoJwtVerifierToken } from "../../src/types/index.js";

export const AUTHORIZED_EMAIL = "authorized@example.com";
export const UNAUTHORIZED_EMAIL = "stranger@example.com";
export const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";
export const PUN_TEXT = "Why did the container create a scope? To resolve itself.";

/** Stands in for the Cognito verifier. `email` is mutable so a test can change
 *  which user the token resolves to; the literal token "invalid" is rejected. */
export const jwtVerifierStub = {
  email: AUTHORIZED_EMAIL,
  verify: async (token: string) => {
    if (token === "invalid") {
      throw new Error("stub verifier: rejected token");
    }
    return { sub: TEST_USER_ID, email: jwtVerifierStub.email };
  },
};

export const bedrockRuntimeStub = {
  send: async () => ({
    body: new TextEncoder().encode(
      JSON.stringify({ content: [{ text: PUN_TEXT }] })
    ),
  }),
};

/** Captures the messages the app would have put on the job queue, so tests can
 *  assert on what crossed the boundary. */
export const sqsStub = {
  sent: [] as any[],
  send: async (command: any) => {
    sqsStub.sent.push(JSON.parse(command.input.MessageBody));
    return {};
  },
};

export const dynamoDBStub = {
  send: async () => ({}),
};

let app: express.Application | null = null;

/**
 * Boots the real Express app through the real DI loader, replacing only the
 * outbound clients. Everything between the HTTP boundary and those clients —
 * routing, both auth middlewares, the request-scoped child container, and the
 * full service graph — is the production wiring.
 *
 * Call this at most once per Jest module registry. Controllers register their
 * handlers onto module-level `Router()` singletons, so a second boot inside one
 * test file would stack duplicate handlers onto the same router.
 */
export const buildTestApp = async () => {
  if (app) {
    return app;
  }

  await loadGlobalDependencies();

  // Last registration wins in tsyringe, and child containers inherit from the
  // parent, so these override the real clients for request scopes too. They
  // must land before ExpressLoader is resolved: the auth middleware captures
  // JwtValidationService (and therefore the verifier) at construction time.
  container.register(CognitoJwtVerifierToken, { useValue: jwtVerifierStub });
  container.register(BedrockRuntimeClient, { useValue: bedrockRuntimeStub });
  container.register(DynamoDBClient, { useValue: dynamoDBStub });
  container.register(SQSClient, { useValue: sqsStub });

  app = express();
  const expressLoader = container.resolve(ExpressLoader);
  await expressLoader.load(app);

  return app;
};

/** Matches `config.api.prefix`. */
export const API_PREFIX = "/ai/api";
