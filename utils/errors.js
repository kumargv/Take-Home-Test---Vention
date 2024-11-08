const logger = require("./logger");

const errorCode = {
  badRequest: 400,
  notFound: 404,
  serverError: 500
};

const badRequestError = message => ({ statusCode: errorCode.badRequest, message });
const notFoundError = message => ({ statusCode: errorCode.notFound, message });

const unexpectedError = (error, message) => {
  if (!error.statusCode) {
    console.error("Unexpected Error");
    console.error(error);
    throw { statusCode: errorCode.serverError, message };
  }
  return error;
};

module.exports = { errorCode, badRequestError, notFoundError, unexpectedError };
