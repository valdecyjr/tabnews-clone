import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match'", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "ValdecysJunior",
          email: "valdecysjunior@gmail.com",
          password: "password123",
        }),
      });

      expect(response.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/ValdecysJunior",
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();
      console.log(response2Body);

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "ValdecysJunior",
        email: "valdecysjunior@gmail.com",
        password: "password123",
        create_at: response2Body.create_at,
        update_at: response2Body.update_at,
      });
      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.create_at)).not.toBeNaN();
      expect(Date.parse(response2Body.update_at)).not.toBeNaN();
    });
    test("With case mismatch'", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "scarsirioth",
          email: "scarsirioth@gmail.com",
          password: "password123",
        }),
      });

      expect(response.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/ScarSirioth",
      );

      expect(response2.status).toBe(200);

      const response2Body = await response2.json();
      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "scarsirioth",
        email: "scarsirioth@gmail.com",
        password: "password123",
        create_at: response2Body.create_at,
        update_at: response2Body.update_at,
      });
      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.create_at)).not.toBeNaN();
      expect(Date.parse(response2Body.update_at)).not.toBeNaN();
    });
    test("With nonexistent username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Usuario nao encontrado",
        action: "Verifique se o username esta correto",
        status_code: 404,
      });
    });
  });
});
