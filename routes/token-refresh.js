var express = require('express');
var jwt = require('jsonwebtoken');
var tokenUtils = require('../utils/token');
var apiTokenRefreshRouter = express.Router();



module.exports = function(app) {
  apiTokenRefreshRouter.post('/', function(req, res) {
    tokenUtils.verify(req.body.token, function(err, newSignedToken) {
      if (err) {
        console.log('error occured in tokenUtils.verify',err);
        res
          .status(401)
          .send({
            error: err
          });
      } else {
        res.status(200).json({
          token: newSignedToken
        });
      }
    });
  });

  //app.use(bodyParser.json());
  app.use('/api/token-refresh', apiTokenRefreshRouter);
};
