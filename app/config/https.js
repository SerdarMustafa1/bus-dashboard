const { PRODUCTION } = require('./keys');

module.exports = (req, res, next) => {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && PRODUCTION)
    return res.redirect('https://' + req.get('host') + req.url);
  next();
};
