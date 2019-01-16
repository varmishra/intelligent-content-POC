'use strict';
const URL = require('url').URL;
const moment = require('moment');
const request = require('request');
const jsonBig = require('json-bigint')({"storeAsString": true});
const Pkg = require('../../package.json');


class ServiceGTW {

    /*
    Example token:

      access_token: 'BrHCNzHaifA8Int9eyQiZsAufzuj',
      expires_in: '30758399',
      refresh_token: '94AKWdU6XQGPhdH2ogvV5ALAXa5HFC8a',
      organizer_key: '5131117652249479429',
      account_key: '1640832331280194563',
      account_type: '',
      firstName: 'Lilly España',
      lastName: 'Webinar',
      email: 'municio_marco_antonio@lilly.com',
      platform: 'GLOBAL',
      version: '2'

     */

    constructor(options) {
        this.user_id = options.user_id;
        this.password = options.password;
        this.client_id = options.client_id;
        this.conn = {};
    }

    _login(cb) {
        const self = this;

        if (typeof self.conn.access_token === 'undefined' || self._checkIfTokenIsExpired()) {
            request({
                url: 'https://api.getgo.com/oauth/access_token',
                method: 'POST',
                headers: {
                    'Accept': 'Application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                form: {
                    'grant_type': 'password',
                    'user_id': self.user_id,
                    'password': self.password,
                    'client_id': self.client_id
                }
            }, function (error, response, body) {

                if (!error && response.statusCode == 200) {
                    self.conn = jsonBig.parse(body)
                    self.conn.expiredDate = Date.now() + parseInt(self.conn.expires_in) * 1000;
                    return cb(200, self.conn)
                } else {
                    console.log(error)
                    return cb(response.statusCode, jsonBig.parse(response))
                }

            });
        } else return cb(200, self.conn);

    }

    /**
     * Checks if the session is expired and resets the connection if necessary
     * @param  {object} e Error object returned by jsforce
     * @return {boolean}  True if there was a connection error, otherwise false.
     * @private
     */
    _checkIfTokenIsExpired() {
        const self = this;
        let dateNow = Date.now();
        let dateExpired = self.conn.expiredDate;

        if (typeof self.conn.expiredDate === 'undefined' || dateNow >= (dateExpired - 60000)) { // Quitamos un minuto por seguridad.
            self.conn = {};
            return true;
        }
        return false;
    }

    getWebinars(req, cb) {
        const self = this;

        let fromTime = "";
        let toTime = "";
        let gtwURL = new URL('https://api.getgo.com/G2W/rest/organizers/{organizer_key}/webinars')

        if (req.query.fromTime) {
            fromTime = moment(req.query.fromTime, 'MM/DD/YYYY').toISOString().split('.')[0] + 'Z';
            gtwURL.searchParams.append('fromTime', fromTime)
        }

        if (req.query.toTime) {
            toTime = moment(req.query.toTime, 'MM/DD/YYYY').add(1, 'd').toISOString().split('.')[0] + 'Z';
            gtwURL.searchParams.append('toTime', toTime)
        }

        self._request(gtwURL, (status, webinars) => {
            return cb(status, webinars)
        })

    }

    getSessionsWebinar(req, webinar, cb) {
        const self = this;
        var gtwURL = new URL('https://api.getgo.com/G2W/rest/organizers/{organizer_key}/webinars/' + webinar + '/sessions')

        self._request(gtwURL, (status, sessions) => {
            return cb(status, sessions)
        })

    }

    async getAttendeesSessionWebinar(req, webinar, session, cb) {
        const self = this;
        var gtwURL = new URL('https://api.getgo.com/G2W/rest/organizers/{organizer_key}/webinars/' + webinar + '/sessions/' + session)

        self._request(gtwURL, (status, attendees) => {
            return cb(status, attendees)
        });
    }

    getWebinar(req, webinar, cb) {
        const self = this;
        let gtwURL = new URL('https://api.getgo.com/G2W/rest/organizers/{organizer_key}/webinars/' + webinar)

        self._request(gtwURL, (status, attendees) => {
            return cb(status, attendees)
        });


    }

    getRegistrants(req, webinar, cb) {
        const self = this;
        let gtwURL = new URL('https://api.getgo.com/G2W/rest/organizers/{organizer_key}/webinars/' + webinar + '/registrants')

        self._request(gtwURL, (status, attendees) => {
            return cb(status, attendees)
        });
    }

    getToken(cb) {
        const self = this;

        self._login((token) => {
            console.log(token)
            return cb(self.conn);

        });
    }

    _request(urlRequest, cb) {
        const self = this;

        self._login((status, token) => {
            //console.log(token)
            urlRequest = urlRequest.toString().replace(encodeURIComponent('{organizer_key}'), token.organizer_key)
            request({
                url: urlRequest,
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token.access_token,
                    'Accept': 'Application/json',
                    'Content-Type': 'Application/json',
                }
            }, function (error, response, body) {

                if (!error && response.statusCode == 200) {
                    var bodyParsed = jsonBig.parse(body);
                    //console.log(bodyParsed)
                    return cb(200, bodyParsed)//res.status(200).json(webinars).end();
                } else {
                    return cb(response.statusCode, response)//res.status(response.statusCode).redirect('/').json(response).end();
                }

            });
        })

    }

}

const GTW = new ServiceGTW(Pkg.options.salesforce.marketingCloud)
exports.GTW = module.exports.GTW = GTW;
