const jwt = require('./utils/jwt');
const tokenUtils = require('./utils/jwt');
const config = require('./config');
const { jsonApiServer } = config;

const express = require('express');
const proxy = require('express-http-proxy');

const app = express();

function isAdmin(req, res, next) {
  if (!req.user.admin) {
    next(new Error('only admin'));
  } else {
    next();
  }
}

// TODO be more restrictive
//cors
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); //TODO maybe we should be more restrictive
  res.header('Access-Control-Allow-Methods', 'OPTIONS, GET,PUT,POST,DELETE,PATCH');
  res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Content-Type, Accept");
  next();
});
//end cors

app.post('/tokens', require('./routes/token-auth'));

app.delete('*', [tokenUtils.expressJwtMiddleware(), isAdmin]);
app.post('*', [tokenUtils.expressJwtMiddleware(), isAdmin]);
app.patch('*', [tokenUtils.expressJwtMiddleware(), isAdmin]);

app.use('/', proxy(jsonApiServer));

// TODO this could probably be in config
app.listen(4000);
