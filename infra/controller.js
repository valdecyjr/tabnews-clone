import { InternalServerError, MethodNotAllowedError } from "infra/errors.js";

function onNoMatchHandler(request, response) {
  const methodNotAllowedError = new MethodNotAllowedError();
  response
    .status(methodNotAllowedError.status_code)
    .json(methodNotAllowedError);
}

function onErrorHandler(error, request, response) {
  const publicErrorObject = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  });

  console.error(publicErrorObject);

  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
