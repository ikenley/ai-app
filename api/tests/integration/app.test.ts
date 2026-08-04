import request from "supertest";
import type express from "express";
import {
  API_PREFIX,
  AUTHORIZED_EMAIL,
  PUN_TEXT,
  TEST_USER_ID,
  UNAUTHORIZED_EMAIL,
  buildTestApp,
  jwtVerifierStub,
  sqsStub,
} from "../helpers/buildTestApp.js";

/**
 * Characterization test for the HTTP surface.
 *
 * This exists to protect the tsyringe -> awilix migration (see
 * docs/di-migration.md). It asserts observable behaviour only — status codes,
 * response bodies, and what reaches the outbound clients — so it should pass
 * unchanged before and after the container swap.
 *
 * One exception is called out in container.test.ts: the request-id propagation
 * bug is deliberately *not* locked in here.
 */
let app: express.Application;

beforeAll(async () => {
  app = await buildTestApp();
});

beforeEach(() => {
  jwtVerifierStub.email = AUTHORIZED_EMAIL;
  sqsStub.sent.length = 0;
});

describe("status routes (unauthenticated)", () => {
  test("GET /status returns ok", async () => {
    const response = await request(app).get(`${API_PREFIX}/status`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  test("GET /status/health returns ok", async () => {
    const response = await request(app).get(`${API_PREFIX}/status/health`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  test("GET /status/info returns the app config block", async () => {
    const response = await request(app).get(`${API_PREFIX}/status/info`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      env: "test",
      name: "ai-api-test",
      version: "0.0.0-test",
    });
  });
});

describe("authentication", () => {
  test("rejects a request with no Authorization header", async () => {
    const response = await request(app)
      .post(`${API_PREFIX}/ai/pun`)
      .send({ prompt: "containers" });

    expect(response.statusCode).toBe(401);
  });

  test("rejects a malformed Authorization header", async () => {
    const response = await request(app)
      .post(`${API_PREFIX}/ai/pun`)
      .set("Authorization", "Bearer")
      .send({ prompt: "containers" });

    expect(response.statusCode).toBe(401);
  });

  test("rejects a token the verifier refuses", async () => {
    const response = await request(app)
      .post(`${API_PREFIX}/ai/pun`)
      .set("Authorization", "Bearer invalid")
      .send({ prompt: "containers" });

    expect(response.statusCode).toBe(401);
  });

  test("accepts a valid token and resolves the service from the request scope", async () => {
    const response = await request(app)
      .post(`${API_PREFIX}/ai/pun`)
      .set("Authorization", "Bearer valid")
      .send({ prompt: "containers" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ content: PUN_TEXT });
  });
});

describe("authorization", () => {
  test("rejects an authenticated user who is not on the allow-list", async () => {
    jwtVerifierStub.email = UNAUTHORIZED_EMAIL;

    const response = await request(app)
      .post(`${API_PREFIX}/image`)
      .set("Authorization", "Bearer valid")
      .send({ prompt: "a cat" });

    expect(response.statusCode).toBe(403);
    expect(sqsStub.sent).toHaveLength(0);
  });

  test("allows a user on the allow-list, and the request-scoped User reaches the service", async () => {
    const response = await request(app)
      .post(`${API_PREFIX}/image`)
      .set("Authorization", "Bearer valid")
      .send({ prompt: "a cat" });

    expect(response.statusCode).toBe(200);

    // The User is registered into the per-request child container by the auth
    // middleware and injected several levels down the graph. Asserting on the
    // queued message proves that path end to end.
    expect(sqsStub.sent).toHaveLength(1);
    expect(sqsStub.sent[0]).toMatchObject({
      prompt: "a cat",
      email: AUTHORIZED_EMAIL,
      userId: TEST_USER_ID,
    });
  });
});
