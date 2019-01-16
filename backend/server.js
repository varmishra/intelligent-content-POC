'use strict';

const Path = require('path');
const Pkg = require(Path.join(__dirname, '..', 'package.json'));
const express = require('express');
const http = require('http');
const request = require('request');
const debug = require('debug');
const errorhandler = require('errorhandler');
const pug = require('pug');
const app = express();

// Helper utility for verifying and decoding the jwt sent from Salesforce Marketing Cloud.
//const verifyJwt = require(Path.join(__dirname, 'lib', 'jwt.js'));
// Helper class that handles all the interactions with Salesforce Service Cloud
// and makes sure open connections are reused for subsequent requests.

const index = require(Path.join(__dirname, 'routes', 'index.js'));
const gtw = require(Path.join(__dirname, 'routes', 'gtw.js'));
const activity = require(Path.join(__dirname, 'routes', 'activity.js'));
const routes = require(Path.join(__dirname, 'routes'));
const cors = require('cors')


app.set('views', Path.join(__dirname, 'views'));
app.set('view engine', 'pug');


var whitelist = ['https://mc.s7.exacttarget.com', 'https://intranet.omegacrmconsulting.com', 'http://localhost:3000']
var corsOptions = {
    origin: function (origin, callback) {
        console.log(origin)
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

global.accessToken = {};

// Register middleware that parses the request payload.
app.use(require('body-parser').raw({
    type: 'application/jwt'
}));

// Serve the custom activity's interface, config, etc.
app.use(express.static(Path.join(__dirname, '..', 'public')));
//app.use(cors(corsOptions))

// Route that is called for every contact who reaches the custom split activity


app.get('/',  routes.index);
app.get('/token',  routes.token);
app.post('/login',  routes.login);
app.post('/logout',  routes.logout);

app.get('/gtw/getWebinars',  gtw.getWebinars);
app.get('/gtw/getWebinar/:webinarKey',  gtw.getWebinar);
//app.get('/gtw/getToken',  gtw.getToken);


// Route that is called for every contact who reaches the custom split activity
app.post('/activity/execute',  activity.execute);

app.post('/activity/publish',  activity.publish);
app.post('/activity/validate',  activity.validate);
app.post('/activity/save',  activity.save);


// Start the server and listen on the port specified by heroku or defaulting to 3000
app.listen(process.env.PORT || 3000, () => {

    console.log(process.env.PORT + ': Service Cloud customsplit backend is now running!');
});

