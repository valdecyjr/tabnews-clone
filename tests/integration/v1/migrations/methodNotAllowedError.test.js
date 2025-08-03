import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("PUT /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "PUT",
      });
      expect(response.status).toBe(405);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Method not allowed",
        action: "Verify the request method",
        status_code: 405,
      });
    });
  });
});
