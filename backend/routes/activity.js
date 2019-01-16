'use strict';
var util = require('util');

// Deps
const Path = require('path');
var util = require('util');
var http = require('https');
const GTW = require(Path.join(__dirname, '../lib', 'gtw.js')).GTW;

exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + req.headers);
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //logData(req);
    res.send(200, 'Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {

    require('jsonwebtoken').verify(req.body.toString('utf8'), process.env.jwtSecret, {
        algorithm: 'HS256'
    }, (err, decoded) => {
        // verification error -> unauthorized request
        if (err) return res.status(401).end();


        return res.status(200).json({success: true});
    });

};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function (req, res) {
    try {

        require('jsonwebtoken').verify(req.body.toString('utf8'), process.env.jwtSecret, {
            algorithm: 'HS256'
        }, (err, decoded) => {

            if (err) {
                console.log("ERROR")
                console.log(err)
            }

            if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
                var email = decoded.inArguments[0].emailAddress;
                var webinarKey = decoded.inArguments[0].webinar;

                try {

                    if (decoded.inArguments[0].type == 'Attendees') {
                        GTW.getSessionsWebinar(req, webinarKey, (status, sessions) => {
                            if (status == 200 && sessions.length > 0) {
                                var founded = false;
                                var sent = false;
                                for (var i = 0; i < sessions.length && !founded; i++) {
                                    GTW.getAttendeesSessionWebinar(req, webinarKey, sessions[i].sessionKey, (status, attendees) => {
                                        console.log("NUMERO ATTENDEES: ", attendees.length)
                                        for (var i = 0; i < attendees.length && !founded; i++) {
                                            if (attendees[i].email == email) {
                                                founded = true;
                                            }
                                        }
                                        if (!sent) {
                                            if (founded) {
                                                sent = true;
                                                return res.status(200).json({branchResult: 'yes'});
                                            } else {
                                                return res.status(200).json({branchResult: 'no'});
                                            }

                                        }
                                    })
                                }


                            } else {
                                //MANEJAR ERROR
                                console.log("ERROR EN ATTENDEES")

                                return res.status(200).json({branchResult: 'error'});

                            }
                        })

                    } else { //Registrant
                        GTW.getRegistrants(req, webinarKey, (status, registrants) => {
                            if (status == 200) {
                                if (registrants.length > 0) {
                                    for (var i = 0; i < registrants.length; i++) {
                                        if (registrants[i].email == email) {
                                            return res.status(200).json({branchResult: 'yes'});
                                        }
                                    }
                                    return res.status(200).json({branchResult: 'no'});
                                }
                            } else {
                                console.log("ERROR EN REGISTRANTS")
                                return res.status(200).json({branchResult: 'error'});
                            }

                            //throw "ERROR AL OBTENER REGISTRADOS";
                        })

                    }
                } catch (Ex) {
                    return res.status(200).json({branchResult: 'error'}).end();
                }
                //return res.status(200).json({branchResult: 'yes'});

            } else {
                console.error('inArguments invalid.');
                return res.status(200).json({branchResult: 'error'}).end();

//            return res.status(400).end();
            }
            // If the token was invalid err is set, otherwise the decoded payload can be found in decoded
        });

    } catch (Ex) {
        return res.status(200).json({branchResult: 'error'}).end();
    }

};


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );

    require('jsonwebtoken').verify(req.body.toString('utf8'), process.env.jwtSecret, {
        algorithm: 'HS256'
    }, (err, decoded) => {
        if (err) return res.status(401).end();

        return res.status(200).json({success: true});
    });

};

/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //logData(req);

    require('jsonwebtoken').verify(req.body.toString('utf8'), process.env.jwtSecret, {algorithm: 'HS256'}, (err, decoded) => {
        // verification error -> unauthorized request
        if (err) return res.status(401).end();

        return res.status(200).json({success: true});
    });
};