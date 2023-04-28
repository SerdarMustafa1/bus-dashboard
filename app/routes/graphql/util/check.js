const Joi = require('@hapi/joi');

exports.joiVehicle = Joi.string()
  .pattern(new RegExp('^[a-zA-Z0-9-_]{16}$'))
  .required();
exports.joi_id = Joi.string()
  .pattern(new RegExp('^[a-zA-Z0-9_-]{7,14}$'))
  .required();
exports.joi_idOpt = Joi.string().pattern(new RegExp('^[a-zA-Z0-9_-]{7,14}$'));
