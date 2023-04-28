const { devNoSec } = require('../../../config/site');
class AuthError extends Error {
  constructor() {
    super('User is not authenticated!');
    this.status = 401;
  }
}

class PermissionError extends Error {
  constructor() {
    super('User do not have enough permissions!');
    this.status = 403;
  }
}

const AuthCheck = (req) => {
  if (devNoSec) return;
  if (!req.isAuth) throw new AuthError();
};

const PermissionCheck = (req, roles) => {
  if (devNoSec) return;
  AuthCheck(req);
  if (!roles.includes(req.userRole)) throw new PermissionError();
};

const SchemaValidator = (schema, args) => {
  const { error, value } = schema.validate(args);
  if (error)
    throw new Error(
      `INVALID INPUT\nArgs: ${JSON.stringify(args)}\nError: ${error}`
    );
  return value;
};

module.exports = {
  AuthCheck,
  PermissionCheck,
  SchemaValidator,
  AuthError,
  PermissionError,
};
