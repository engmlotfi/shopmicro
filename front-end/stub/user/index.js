(function (){
    'use strict';
    var express   = require("express")
        , helpers   = require("../../helpers")
        , app       = express()
        , grpc = require("grpc")
        , protoLoader = require("@grpc/proto-loader")
        , cookie_name = "logged_in"
        , qs = require('querystring')
        , path= require("path");
    const UsersHost = process.env.UsersHost || 'localhost:3001'
    var PROTO_PATH = path.join(__dirname, '..', '..','..', 'protos', 'users.proto');
    //Load the protobuf
    var users_proto = grpc.loadPackageDefinition(
        protoLoader.loadSync(PROTO_PATH, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        })
    );

    //Create gRPC client
    var grpc_client = new users_proto.users.UsersService(
        UsersHost,
        grpc.credentials.createInsecure()
    );

    app.post("/login", function (req, res, next) {
        var payload=req.body;
        grpc_client.loginUser(payload, {}, (err, user) => {
            if (err){
                req.session.userId = null;//customerId;
                req.session.userName= null;
                req.session.userRole = null;
                res.clearCookie('userId');
                res.clearCookie('userName');
                res.clearCookie('userRole');
                //console.log("Error with log in: " + err.details);
                res.status(500);
                res.end("User Not found");

            }else{
                console.log(user);
                //var customerId = user.id;
                //console.log(customerId);
                req.session.userId = user.id;//customerId;
                req.session.userName= user.name;
                req.session.userRole = user.role;
                //console.log("set cookie" + customerId);
                res.status(200);
                res.cookie(cookie_name, req.session.id, {
                    maxAge: 3600000
                });
                res.cookie('userId', req.session.userId, {
                    maxAge: 3600000
                });
                res.cookie('userName', req.session.userName, {
                    maxAge: 3600000
                });
                res.cookie('userRole', req.session.userRole, {
                    maxAge: 3600000
                });
                //console.log("Sent cookies.");
                res.end(JSON.stringify({role:user.id,
                    name:user.name}));
            }
        });
    });
    app.post("/logout", function (req, res, next) {

                req.session.userId = null;//customerId;
                req.session.userName= null;
                req.session.userRole = null;
                res.clearCookie('userId');
                res.clearCookie('userName');
                res.clearCookie('userRole');
                //console.log("Error with log in: " + err.details);
                res.status(200);
                res.end("User Logged out");
    });

    // get all products
    app.get("/users", function (req, res, next) {
        var body, statusCode;
        grpc_client.getUsers({}, {}, (err, users) => {
            if (err) {
                body = JSON.stringify(err.details);
                statusCode = 500;//Internal Error
            } else {
                //console.log(products);
                body = JSON.stringify(users.users);
                statusCode = 200;//Successfull
            }
            res.writeHeader(statusCode);
            res.end(body);
        });

    });

    app.post("/register", function (req, res, next) {
        var userId = helpers.getUserId(req, app.get("env"));
        if(userId=="") {
            return res.status(400).send("no administrator logged in");
        }
        var payload={requester_id:userId,
            managedUser:req.body};
        grpc_client.addUser(payload, {}, (err, status) => {
            if (err){
                res.status(500);
                res.end(err.details);

            }else{
                console.log(status);
                res.status(200);
                res.end("new user registerd");
            }
        });
    });
    // update existing product
    app.post("/updateuser", function (req, res) {

        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            var userId = helpers.getUserId(req, app.get("env"));
            if(userId=="") {
                return res.status(400).send("no administrator logged in");
            }
            var user = qs.parse(body);

            var payload = {
                requester_id: userId,
                managedUser: user
            };
            grpc_client.updateUser(payload, {}, (err, status) => {
                if (err) {
                    res.status(500);
                    res.end(err.details);

                } else {
                    console.log(status);
                    res.status(200);
                    res.end("user details updated");
                }
            });
        });
    });

    // Delete specific product
    app.delete("/user/:id", function (req, res, next) {
        var body, statusCode;
        var userId = helpers.getUserId(req, app.get("env"));
        if (req.params.id) {
            const payload = { requester_id: userId,
                id: req.params.id};
            grpc_client.deleteUser(payload, {}, (err, result) => {
                if (err){
                    body=JSON.stringify(err.details);
                    statusCode=500;//Internal Error
                }else{
                    //console.log(products);
                    body=JSON.stringify(result);
                    statusCode=200;//Successfull
                }
                res.writeHeader(statusCode);
                res.end(body);
            });
        }else {
            body = "Must pass product ID";
            statusCode = 400;//Bad request Error
            res.writeHeader(statusCode);
            res.end(body);
        }
    });
    // make the service available for front end
    module.exports = app;
}());

