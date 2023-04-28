const dotenv = require('dotenv');
dotenv.config();


let ENV = true;

if (process.env.NODE_ENV === 'production') {
ENV = true;
}

const PRODUCTION = ENV;
const env = process.env.NODE_ENV;
console.log('test keys -----------', env );
console.log('======== KEYS PRODUCTION ========', PRODUCTION);

module.exports = {
  PRODUCTION,
  JWTSecret: PRODUCTION
    ? 'jdas56dgYhdadaD89fASaFsTRsFAWw'
    : 'srbsarrFBbst3rbsrgSeafelnfbNJN',
  recovery: '7rh7288g28u2ug4v3',
  recoveryValidate: '6dgh893jk02f0JGawy7d',
  mgApi: process.env.MAILGUN_API_KEY,
  mgApiPublic: process.env.MAILGUN_API_KEY_PUBLIC,
  awsAccess: process.env.AWS_ACCESS_KEY,
  awsAccessSecret: process.env.AWS_SECRET_ACCESS_KEY,
};
