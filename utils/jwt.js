const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const API_SECRET = process.env.API_SECRET || 'magic_secret_key';  //TODO add info to Readme that we should pass API_SECRET as env var

if(!API_SECRET) {
  //TODO it would be better to throw probably!
  console.warn('missing a secret for jwt');
}

const expiresIn = 2 * 24 * 60 * 60;//2 days

module.exports = {
  sign(obj) {
    console.log('signing', API_SECRET,  obj);

    const token = jwt.sign(obj, API_SECRET, { expiresIn });
    console.log('after sign');
    return token;
  },
  verify(token, cb) {
    var self = this;  //TODO cleanup this, self , etc
    jwt.verify(token, API_SECRET,(err, decoded) => {
      if (err) {
        cb(err);
      } else {
        var token = self.sign(decoded);
        cb(null,token);
      }
    });
  },
  expressJwtMiddleware(options = {}) {
    return expressJwt(Object.assign({}, options, { secret: API_SECRET }));
  }
}
