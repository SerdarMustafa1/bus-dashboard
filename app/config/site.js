const { mgApi, mgApiPublic, PRODUCTION } = require('./keys');


console.log('======== SITE Environment ========', PRODUCTION);

const database = PRODUCTION
  ? {
      host: process.env.DB_MYSQL_HOST,
      user: process.env.DB_MYSQL_USER,
      password: process.env.DB_MYSQL_PASSWORD,
    }
  : {
      host: 'localhost',
      port: 3307,
      user: 'root',
      password: 'password',
    };

const { MAILGUN_DOMAIN, MAILGUN_HOST } = process.env;
const mailgun = require('mailgun-js')({
  apiKey: mgApi,
  domain: MAILGUN_DOMAIN,
  host: MAILGUN_HOST,
});
const mailgunValidation = require('mailgun-js')({
  apiKey: mgApiPublic,
  domain: MAILGUN_DOMAIN,
});

module.exports = {
  production: PRODUCTION,
  devNoSec: !PRODUCTION && false,
  domain: 'busdashboard.oda.agency',
  mailgun,
  mailgunValidation,
  databaseConnection: database,
};
