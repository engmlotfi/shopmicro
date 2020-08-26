(function() {
    'use strict';

    var async = require("async"),
        express = require("express"),
        request = require("request"),
        endpoints = require("../endpoints"),
        helpers = require("../../helpers"),
        app = express(),
        cookie_name = "logged_in"


    app.get("/customers/:id", function(req, res, next) {
        helpers.simpleHttpRequest(endpoints.customersUrl + "/" + req.session.customerId, res, next);
    });
    app.get("/cards/:id", function(req, res, next) {
        helpers.simpleHttpRequest(endpoints.cardsUrl + "/" + req.params.id, res, next);
    });

    app.get("/customers", function(req, res, next) {
        helpers.simpleHttpRequest(endpoints.customersUrl, res, next);
    });
    app.get("/addresses", function(req, res, next) {
        helpers.simpleHttpRequest(endpoints.addressUrl, res, next);
    });
    app.get("/cards", function(req, res, next) {
        helpers.simpleHttpRequest(endpoints.cardsUrl, res, next);
    });
    // Create Customer - TO BE USED FOR TESTING ONLY (for now)
    app.post("/customers", function(req, res, next) {
        var options = {
            uri: endpoints.customersUrl,
            method: 'POST',
            json: true,
            body: req.body
        };

        console.log("Posting Customer: " + JSON.stringify(req.body));

        request(options, function(error, response, body) {
            if (error) {
                return next(error);
            }
            helpers.respondSuccessBody(res, JSON.stringify(body));
        }.bind({
            res: res
        }));
    });


    // Create Address - TO BE USED FOR TESTING ONLY (for now)
    app.post("/addresses", function(req, res, next) {
        var options = {
            uri: endpoints.addressUrl,
            method: 'POST',
            json: true,
            body: req.body
        };
        console.log("Posting Address: " + JSON.stringify(req.body));
        request(options, function(error, response, body) {
            if (error) {
                return next(error);
            }
            helpers.respondSuccessBody(res, JSON.stringify(body));
        }.bind({
            res: res
        }));
    });

    // Create Card - TO BE USED FOR TESTING ONLY (for now)
    app.post("/cards", function(req, res, next) {
        var options = {
            uri: endpoints.cardsUrl,
            method: 'POST',
            json: true,
            body: req.body
        };
        console.log("Posting Card: " + JSON.stringify(req.body));
        request(options, function(error, response, body) {
            if (error) {
                return next(error);
            }
            helpers.respondSuccessBody(res, JSON.stringify(body));
        }.bind({
            res: res
        }));
    });

    // Delete Customer - TO BE USED FOR TESTING ONLY (for now)
    app.delete("/customers/:id", function(req, res, next) {
        console.log("Deleting Customer " + req.params.id);
        var options = {
            uri: endpoints.customersUrl + "/" + req.params.id,
            method: 'DELETE'
        };
        request(options, function(error, response, body) {
            if (error) {
                return next(error);
            }
            helpers.respondSuccessBody(res, JSON.stringify(body));
        }.bind({
            res: res
        }));
    });

    // Delete Address - TO BE USED FOR TESTING ONLY (for now)
    app.delete("/addresses/:id", function(req, res, next) {
        console.log("Deleting Address " + req.params.id);
        var options = {
            uri: endpoints.addressUrl + "/" + req.params.id,
            method: 'DELETE'
        };
        request(options, function(error, response, body) {
            if (error) {
                return next(error);
            }
            helpers.respondSuccessBody(res, JSON.stringify(body));
        }.bind({
            res: res
        }));
    });

    // Delete Card - TO BE USED FOR TESTING ONLY (for now)
    app.delete("/cards/:id", function(req, res, next) {
        console.log("Deleting Card " + req.params.id);
        var options = {
            uri: endpoints.cardsUrl + "/" + req.params.id,
            method: 'DELETE'
        };
        request(options, function(error, response, body) {
            if (error) {
                return next(error);
            }
            helpers.respondSuccessBody(res, JSON.stringify(body));
        }.bind({
            res: res
        }));
    });

    // Create Customer - TO BE USED FOR TESTING ONLY (for now)
    app.post("/register", function(req, res, next) {
        var options = {
            uri: endpoints.registerUrl,
            method: 'POST',
            json: true,
            body: req.body
        };

        console.log("Posting Customer: " + JSON.stringify(req.body));
        request(options, function(error, response, body) {
            if (error !== null ) {
                console.log("error "+JSON.stringify(error));
                return;
            }
            if (response.statusCode == 200 &&
                body != null && body != "") {
                if (body.error) {
                    console.log("Error with log in: " + err);
                    res.status(500);
                    res.end();
                    return;
                }
                console.log(body);
                var customerId = body.id;
                console.log(customerId);
                req.session.customerId = customerId;
                console.log("set cookie" + customerId);
                res.status(200);
                res.cookie(cookie_name, req.session.id, {
                    maxAge: 3600000
                }).send({id: customerId});
                console.log("Sent cookies.");
                res.end();
                return;
            }
            console.log(response.statusCode);

        });

    });

    app.post("/login", function(req, res, next) {
        var options = {
            uri: endpoints.loginUrl,
            method: 'POST',
            json: true,
            body: req.body
        };

        console.log("Posting Customer: " + JSON.stringify(req.body));
        request(options, function(error, response, body) {
            if (error !== null ) {
                console.log("error "+JSON.stringify(error));
                return;
            }
            if (response.statusCode == 200 &&
                body != null && body != "") {
           //     body = JSON.parse(body);
                console.log('body '+JSON.stringify(body))
                if (body.error) {
                    console.log("Error with log in: " + body.error);
                    res.status(500);
                    res.end();
                    return;
                }
                console.log(body);
                var customerId = body.id;
                console.log('cust id ' +customerId);
                req.session.customerId = customerId;
                console.log("set cookie" + customerId);
                res.status(200);
                res.cookie(cookie_name, req.session.id, {
                    maxAge: 3600000
                }).send({id: customerId});
                console.log("Sent cookies.");
                res.end();
                return;
            }
            console.log(response.statusCode);

        });

    });

    module.exports = app;
}());
