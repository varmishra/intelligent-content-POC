'use strict';

const Path = require('path');
const jsonBig = require('json-bigint')({"storeAsString": true});
const GTW = require('../lib/gtw.js').GTW;


exports.getWebinars = async function (req, res) {

    GTW.getWebinars(req, (status, response) => {
        if (status = 200) {
            console.log(response)
            return res.status(status).json(response);

        } else if (status = 401) {
            return res.status(status).json(response).end();
        } else {
            return res.status(status).json(response).end();
        }
    })
    //return res.status(200).json(webinars).end();

}


exports.getWebinar = async function (req, res) {
    console.log(req.params)
    GTW.getWebinar(req, req.params.webinarKey, (status, response) => {
        if (status = 200) {
            console.log(response)
            return res.status(status).json(response);

        } else if (status = 401) {
            return res.status(status).json(response).end();
        } else {
            return res.status(status).json(response).end();
        }
    })

}

exports.getToken = async function (req, res) {

    GTW.getToken((token) => {

        return res.status(200).json(token);

    })

}