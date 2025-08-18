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
  });
});
