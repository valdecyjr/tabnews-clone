import user from "models/user.js";
import password from "models/password.js";
import { UnauthorizedError, NotFoundError } from "infra/errors.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);
    return storedUser;
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados de autenticação inválidos",
        action: "Verifique seu email e senha e tente novamente.",
        cause: err,
      });
    }
    throw err;
  }
}

async function findUserByEmail(providedEmail) {
  let storedUser;
  try {
    storedUser = await user.findOneByEmail(providedEmail);
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw new UnauthorizedError({
        message: "Email não confere",
        action: "Verifique se este dado está correto",
      });
    }
    throw err;
  }
  return storedUser;
}

async function validatePassword(providedPassword, storedPassword) {
  const correctPassword = await password.compare(
    providedPassword,
    storedPassword,
  );
  if (!correctPassword) {
    throw new UnauthorizedError({
      message: "Senha não confere",
      action: "Verifique se este dado está correto",
    });
  }

  return correctPassword;
}

const authentication = { getAuthenticatedUser };

export default authentication;
