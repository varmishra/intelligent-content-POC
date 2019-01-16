'use strict';

// Deps
var activity = require('./activity');
var cont = 0;

const GTW = require('../lib/gtw.js');
const oauth2 = require('simple-oauth2').create({
    client: {
        id: 'TOW7ypyrKO17kBdqH4sCFV1mpEvAhKOt',
        secret: 'ACZ2Ai1TdpjuhMWA'
    },
    auth: {
        tokenHost: 'https://api.getgo.com',
        tokenPath: '/oauth/v2/token',
        authorizePath: '/oauth/v2/authorize'
    },
    options: {
        authorizationMethod: 'header',
        bodyFormat: 'form'
    }
});

/*
 * GET home page.
 */
exports.index = function (req, res) {
    console.log(GTW)
    res.render('index', {title: 'Test-customsplit', hasToken: 1}); //Debe de ir con param hasToken=1
};


exports.token = async function (req, res) {
    console.log(accessToken)

    return res.status(200).json(accessToken);
};


exports.login = function (req, res) {
    console.log('req.body: ', req.body);
    res.redirect('/');
};

exports.logout = function (req, res) {
    req.session.token = '';
};