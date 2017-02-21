# jwt-auth

this is a service that authenticates the API calls against the jsonapi server


#### config
this service uses https://www.npmjs.com/package/config for managing configuration

by default you will find in the ./config/default.js that jsonApiServer is expected to be on the localhost:3000  

you can change it by providing a config file like production.js and spinning up the server like NODE_ENV=lan node index.js 
