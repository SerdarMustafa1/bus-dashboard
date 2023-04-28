const path = require('path');
const bodyParser = require('body-parser');
const requireHTTPS = require('./app/config/https');
const express = require('express');
const app = express();
require('./app/db');

app.use(requireHTTPS);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Auth-Token');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use((req, res, next) => {
  if (req.url.match(/(^\/api)|(^\/assets)|(^\/static)|(\.\w{2,}$)/i)) {
    return next();
  } else {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  }
});

app.use(express.static(path.join(__dirname, 'client', 'build')));

app.use(require('./app/config/auth'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', require('./app/routes/api'));

const PORT = process.env.PORT || 3007;
const environment = process.env.NODE_ENV || 'development';
app.listen(PORT, console.log(`Server started on ${PORT}. with ${environment} environment ${new Date()}`));

// const session = require('express-session')
// const csrf = require('csurf');
// const csurfProtection = csrf(); // Used by router
// app.use(session({F4001
//   secret: '.ds;asSup13r13jaewifdISDJ23i',
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: true }
// }))
