import bcrytpjs from "bcryptjs";

async function hash(password) {
  const rounds = getNumberOfRounds();
  const passwordPlusPepper = addPepperToPassword(password);
  return await bcrytpjs.hash(passwordPlusPepper, rounds);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(providedPassword, storedPassword) {
  const providedPasswordPlusPepper = addPepperToPassword(providedPassword);
  return await bcrytpjs.compare(providedPasswordPlusPepper, storedPassword);
}

function addPepperToPassword(password) {
  if (!process.env.PEPPER) {
    throw new Error("PEPPER environment variable is not set");
  }
  return password + process.env.PEPPER;
}

const password = {
  hash,
  compare,
};

export default password;
