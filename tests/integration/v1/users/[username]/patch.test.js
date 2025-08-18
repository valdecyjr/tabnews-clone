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
      const user1response = await fetch("http://localhost:3000/api/v1/users", {
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
      const user2response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateusername2",
          email: "duplicate2@username.com",
          password: "password123",
        }),
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
      expect(user1response.status).toBe(201);
      expect(user2response.status).toBe(201);
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
      const user1response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usersensitiveCase",
          email: "duplicate@usersensitiveCase.com",
          password: "password123",
        }),
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
      expect(user1response.status).toBe(201);
      expect(response.status).toBe(200);
    });
    test("With duplicate 'email'", async () => {
      const user1response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateemail",
          email: "duplicate@email.com",
          password: "password123",
        }),
      });
      const user2response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateemail2",
          email: "duplicate2@email.com",
          password: "password123",
        }),
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/duplicateusername2",
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
      expect(user1response.status).toBe(201);
      expect(user2response.status).toBe(201);
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
      const user1response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueusername",
          email: "uniqueusername@username.com",
          password: "password123",
        }),
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueusername",
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

      expect(user1response.status).toBe(201);
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueusername2",
        email: "uniqueusername@username.com",
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
      const user1response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueemail",
          email: "uniqueemail@email.com",
          password: "password123",
        }),
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueemail",
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

      expect(user1response.status).toBe(201);
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueemail",
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
      const user1response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "newpassword",
          email: "newpassword@password.com",
          password: "password123",
        }),
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/newpassword",
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

      expect(user1response.status).toBe(201);
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "newpassword",
        email: "newpassword@password.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername("newpassword");
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
