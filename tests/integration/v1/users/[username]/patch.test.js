import { version as uuidVersion } from "uuid";
import user from "models/user.js";
import password from "models/password";

import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "PATCH",
        },
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
    test("With duplicate 'username'", async () => {
      await orchestrator.createUser({
        username: "duplicateusername",
      });
      await orchestrator.createUser({
        username: "duplicateusername2",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/duplicateusername2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "duplicateusername",
          }),
        },
      );
      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Username ja cadastrado",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });
    test("With duplicate 'username' With case sensitive", async () => {
      await orchestrator.createUser({
        username: "usersensitiveCase",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/usersensitiveCase",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "UserSensitiveCase",
          }),
        },
      );
      expect(response.status).toBe(200);
    });
    test("With duplicate 'email'", async () => {
      await orchestrator.createUser({
        email: "duplicate@email.com",
      });
      const createdUser2 = await orchestrator.createUser({
        email: "duplicate2@email.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "duplicate@email.com",
          }),
        },
      );
      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Email ja cadastrado",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });
    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueusername",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueusername2",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueusername2",
        email: createdUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
    test("With unique 'email'", async () => {
      const createdUser = await orchestrator.createUser({
        email: "uniqueemail@email.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueemail2@email.com",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        email: "uniqueemail2@email.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "password123",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "1234567890",
          }),
        },
      );
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      console.log(responseBody);

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        email: createdUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(createdUser.username);
      const correctPasswordMatch = await password.compare(
        "1234567890",
        userInDatabase.password,
      );
      expect(correctPasswordMatch).toBe(true);
      const incorrectPasswordMatch = await password.compare(
        "password123",
        userInDatabase.password,
      );
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
