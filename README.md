# jwt-auth

this is a service that authenticates the API calls against the jsonapi server

it also does some specific work for the application it is loosely tight (like for example securing some api calls)


#### config
this service uses https://www.npmjs.com/package/config for managing configuration

by default you will find in the ./config/default.js that jsonApiServer is expected to be on the localhost:3000  

you can change it by providing a config file like production.js and spinning up the server like NODE_ENV=lan node index.js 


#### to download the code and spin the server

1. copy contents of https://github.com/jedrula-communications/jwt-auth/blob/master/bin/build to a file on the server like build_jwt-auth

2. sh build_jwt-auth

3. cd jwt-auth-master

4. spin it
```
node index.js
```

