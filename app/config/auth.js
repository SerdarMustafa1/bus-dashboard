const jwt = require('jsonwebtoken');
const { JWTSecret } = require('./keys');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(' ')[1];
  if (!token || token === '' || token === 'null' || token === 'undefined') {
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, JWTSecret);
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  const { userId, userName, userRole } = decodedToken;
  if (userRole === 7) {
    req.isAuth = true;
    req.userRole = 7;
    req.userName = 'Shared';
    return next();
  }
  if (!userId || !userName || userRole === null || userRole === undefined) {
    req.isAuth = false;
    return next();
  }
  req.installerId = decodedToken.installerId;
  req.isAuth = true;
  req.userId = userId;
  req.userName = userName;
  req.userRole = userRole;
  next();
};
