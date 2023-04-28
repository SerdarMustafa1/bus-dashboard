const config = require('../config/site');

const AuthCheck = (req, res, next) => {
  if (!req.isAuth) return res.sendStatus(401);
  return next();
};

const PermissionCheck = (req, res, next, roles) => {
  if (!config.production) return next();
  if (config.production && !req.isAuth) return res.sendStatus(401);
  if (!roles.includes(req.userRole)) return res.sendStatus(403);
  return next();
};

module.exports = {
  AuthCheck,
  PermissionCheck,
};
