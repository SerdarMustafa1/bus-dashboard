const express = require('express');
const router = express.Router();

const { PermissionError, AuthError } = require('./graphql/util/error');

const datatable = require('./datatables/datatable');
const upload = require('./upload/upload');

const AuthDatatable = (req, res, next) =>
  !req.isAuth || ![1, 3, 5, 11].includes(req.userRole)
    ? res.sendStatus(401)
    : next();

const AuthUpload = (req, res, next) =>
  req.isAuth ? next() : res.sendStatus(401);

router.use('/upload', AuthUpload, upload);
router.use('/datatable', AuthDatatable, datatable);

// -------------------  GraphGL (ENABLED) --------------------------

const { production } = require('../config/site');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const graphqlHTTP = require('express-graphql');

router.use(
  '/',
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: !production,
    customFormatErrorFn(err) {
      // if (!err.originalError) return err;
      if (err.message === new AuthError().message)
        return { message: err.message, status: 401 };
      if (err.message === new PermissionError().message)
        return { message: err.message, status: 403 };
      console.log(err);
      // const message = err.originalError.message || "An error occured";
      // const status = err.originalError.status || 400;
      const message = 'Bad request';
      const status = 400;
      return { message, status };
    },
  })
);

router.use('*', (_, res) => res.sendStatus(404));

module.exports = router;
