import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import user from "models/user.js";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "valdecysjunior",
          email: "valdecysjunior@gmail.com",
          password: "password123",
        }),
      });
      expect(response.status).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "valdecysjunior",
        email: "valdecysjunior@gmail.com",
        password: responseBody.password,
        create_at: responseBody.create_at,
        update_at: responseBody.update_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.create_at)).not.toBeNaN();
      expect(Date.parse(responseBody.update_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("valdecysjunior");
      const correctPasswordMatch = await password.compare(
        "password123",
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);
      const incorrectPasswordMatch = await password.compare(
        "SenhaErrada",
        userInDatabase.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });
    test("With duplicate 'email'", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "COntent-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateemail",
          email: "duplicate@email.com",
          password: "password123",
        }),
      });
      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateemail2",
          email: "Duplicate@email.com",
          password: "password123",
        }),
      });
      expect(response.status).toBe(201);
      expect(response2.status).toBe(400);

      const responseBody = await response2.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Email ja cadastrado",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });
    test("With duplicate 'username'", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateusername",
          email: "duplicate@username.com",
          password: "password123",
        }),
      });
      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateusername",
          email: "duplicate2@username.com",
          password: "password123",
        }),
      });
      expect(response.status).toBe(201);
      expect(response2.status).toBe(400);

      const responseBody = await response2.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Username ja cadastrado",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });
  });
});
