(function (){
    'use strict';
    var express   = require("express")
        , helpers   = require("../../helpers")
        , app       = express()
        , grpc = require("grpc")
        , protoLoader = require("@grpc/proto-loader")
        , qs = require('querystring')
        , async     = require("async")
        , path= require("path");
    const CartHost = process.env.CartHost || 'localhost:3003'
    var PROTO_PATH = path.join(__dirname, '..', '..','..', 'idl', 'cart.proto');
    //Load the protobuf
    var cart_proto = grpc.loadPackageDefinition(
        protoLoader.loadSync(PROTO_PATH, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        })
    );


    //Create gRPC client
    var grpc_client = new cart_proto.cartPackage.CartService(
        CartHost,
        grpc.credentials.createInsecure()
    );

    // add to cart
    app.post("/cart", function (req, res) {
        var userId = helpers.getUserId(req, app.get("env"));
        var payload = {
            customer_id: userId,
            product_id: req.body.id,
            quantity: req.body.qty
        }
        grpc_client.addItem(payload, {}, (err, result) => {
            if (err == null) {
                res.status(201).send(result)
            } else {
                res.status(405).send(err)
            }
        });
    });

    // add to cart
    app.post("/checkout", function (req, res) {
        var userId = helpers.getUserId(req, app.get("env"));
        var payload = {
            customer_id: userId,
        }
        grpc_client.checkOut(payload, {}, (err, result) => {
            if (err == null) {
                res.status(201).send(result)
            } else {
                res.status(405).send(err)
            }
        });
    });

    // get all cart items
    app.get("/cart", function (req, res, next) {
        var userId = helpers.getUserId(req, app.get("env"));
        if(userId=="") {
            return res.status(400).send("no user logged in");
        }
        var payload={
            customer_id : userId
        }
        grpc_client.getItems(payload, {}, (err, items) => {
            if (err) {
                res.writeHeader(400);
                res.end(err.details);
            } else {
                var body=JSON.stringify(items.items);
                res.writeHeader(200);
                res.end(body);
            }
        });
    });

    // Delete specific product
    app.delete("/cart/:id", function (req, res, next) {
        var userId = helpers.getUserId(req, app.get("env"));
        var body, statusCode;
        var payload={
            customer_id: userId,
            product_id: parseInt(req.params.id)
        }
        if (req.params.id) {
            grpc_client.deleteItem(payload, {}, (err, result) => {
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

