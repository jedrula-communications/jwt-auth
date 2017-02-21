// TODO add refresh token
const express = require('express');
const request = require('request');
const tokenUtils = require('../utils/jwt');
const async = require('async');
const URI = require('urijs');
const config = require('config');
const jsonApiServer = config.get('jsonApiServer');
console.log('got config ', jsonApiServer);
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;
const bodyParser = require('body-parser');

//TODO make sure that this uses SSL
module.exports = [bodyParser.json(), function (req, res, next) {
  console.log('req.body', req.body)
  const { username, password } = req.body;
  const identification = username;
  if(!identification) {
    next(new Error('missing identification/username'));
  } else if(!password) {
    next(new Error('missing password'));
  } else {
    const url = getUserRequestUrl(jsonApiServer, identification, password);
    request(url, function (error, response, body) {
      if(error) {
        next(error);
      } else if (response.statusCode !== 200) {
        console.log('here');
        res.status(response.statusCode).json(body);
      } else {
        // TODO prevent this callback hell with async
        // console.log('// TODO prevent this callback hell with async', response);
        new JSONAPIDeserializer().deserialize(JSON.parse(body), function (JSONAPIDeserializerErr, users) {
          if (JSONAPIDeserializerErr) {
            next(JSONAPIDeserializerErr)
          } else if(users.length !== 1) {
            next(new Error('there should be exatcly one user'));
          } else {
            const user = users[0];
            const token = tokenUtils.sign(user);
            res.status(200).json({ token });
          }
        });
      }
    });
  }
}];

function getUserRequestUrl(endpoint, identification, password) {
  const url = new URI(`${endpoint}/users`)
  url.addQuery("filter[identification]", identification);
  url.addQuery("filter[password]", password)
  return url.toString();
}
