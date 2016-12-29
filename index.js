const URI = require('urijs');
const jwt = require('./utils/jwt');
const tokenUtils = require('./utils/jwt');
const config = require('./config');
const { jsonApiServer } = config;
const request = require('request');

const express = require('express');
const proxy = require('express-http-proxy');

const app = express();

function isAdmin(req) {
  return req.user && req.user.admin;
}

//makes a GET request to json api server to see if any resource is fetched for given id for specified owner id
function isOwner(options, cb) {
  const { type, id, userId } = options;
  const url = new URI(`/${type}`);
  // TODO use soemthing more generic like owner instead of author!
  url.addQuery('filter[author]', userId);
  url.addQuery('filter[id]', id);
  console.log(url.toString());
  request(jsonApiServer + url.toString(), (err, response) => {
    // console.log('response.body', response.body);
    if(err) {
      cb(err);
    } else if(!response.body.data || !response.body.data.length) {
      cb('did not fetch anything for this owner');
    } else {
      cb(response.body.errors);
    }
  })
}

function isAdminMiddleware(req, res, next) {
  if (!isAdmin(req)) {
    next(new Error('only admin'));
  } else {
    next();
  }
}

function hasRightsMiddleware(req, res, next) {
  if (isAdmin(req)) {
    next();
  } else {
    const { type, id } = req.params;
    if(!type || !id || !req.user.id) {
      next('missing something from options');
    } else {
      const options = { type, id, userId: req.user.id }
      isOwner(options, next);
    }
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

//all routes that do not need jwt token
app.post('/tokens', require('./routes/token-auth'));
app.post('/users', proxy(jsonApiServer));
//end of all routes that do not need jwt token

// TODO maybe does not need to be in an array
app.post('*', [tokenUtils.expressJwtMiddleware()]);
// TODO make sure this catches every case
app.delete('/:type/:id*', [tokenUtils.expressJwtMiddleware(), hasRightsMiddleware]);
app.patch('/:type/:id*', [tokenUtils.expressJwtMiddleware(), hasRightsMiddleware]);


// TODO stop using TODOs wherever, use github issues ?
// TODO style md-card with sth like border-right and border-bottom 2px solid red
// TODO add WIP to posts so that you can see which posts are yet to be published
// TODO fix number of tags requests in the background
// TODO fix clearing local storage on session logout?
// TODO add owned route

// TODO maybe we can use app.use to DRY tokenUtils.expressJwtMiddleware()
app.get('/posts*', tokenUtils.expressJwtMiddleware({ credentialsRequired: false }), proxy(jsonApiServer, {
  decorateRequest: function(proxyReq, originalReq) {
    if(!isAdmin(originalReq)) {
      const { path, method } = proxyReq;
      if(path.startsWith('/posts') && method === 'GET') {
        const url = new URI(path);
        console.log('adding query public')
        url.addQuery('filter[public]', true);
        // TODO do something like url.addQuery('filter[author]', 'b98dd97d-ef5d-454e-8bc5-90858d9b8003') for private posts
        proxyReq.path = url.toString();
      }
    }
    return proxyReq;
  }
}));


const addCreationDateOptions = {
  decorateRequest: function(proxyReq, originalReq) {
    console.log('proxyReq styff', proxyReq);
    console.log('=======')
    
    const parsed = JSON.parse(proxyReq.bodyContent)
    parsed.data.attributes.date = Date.now();
    proxyReq.bodyContent = JSON.stringify(parsed);
    console.log('proxyReq styf2f', proxyReq.bodyContent );
    return proxyReq;
  },
};

app.post('/posts', proxy(jsonApiServer, addCreationDateOptions));

app.use('/', proxy(jsonApiServer));

// TODO this could probably be in config
const port = 4000;
app.listen(port, (err) => {
  if(err) {
    console.error('error in listen cb', err);
  } else {
    console.log(`server listening on ${port}`);
  }
});
