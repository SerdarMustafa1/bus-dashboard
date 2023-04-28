const Email = require('../models/mysql/email');
const Joi = require('@hapi/joi');

const { mailgunValidation } = require('../config/site');

module.exports = async (email) => {
  try {
    if (!Joi.string().email().validate(email)) return null;

    const res = await Email.getByEmail(email);
    if (res) return res.isValid;

    console.log('Validating new email');
    const validation = await mailgunValidation.validate(email);
    let valid = validation && validation.is_valid;
    await Email.createAsync(new Email({ email, isValid: valid }));
    return valid;
  } catch (e) {
    console.log('EMAIL VALIDATION ERROR', e);
    return null;
  }
};
