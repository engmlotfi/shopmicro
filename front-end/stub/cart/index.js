(function (){
    'use strict';
    const express   = require("express")
        , helpers   = require("../../helpers")
        , app       = express()
        , grpc = require("grpc")
        , protoLoader = require("@grpc/proto-loader")
        , qs = require("querystring")
        , async     = require("async")
        , path= require("path");
    const CartHost = process.env.CartHost || 'localhost:3003'
    const PROTO_PATH = path.join(__dirname, '..', '..','..', 'idl', 'cart.proto');
    //Load the protobuf
    const cart_proto = grpc.loadPackageDefinition(
        protoLoader.loadSync(PROTO_PATH, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        })
    );


    //Create gRPC client
    const grpc_client = new cart_proto.cartPackage.CartService(
        CartHost,
        grpc.credentials.createInsecure()
    );

    // add to cart
    app.post("/cart", function (req, res) {
        let userId = helpers.getUserId(req, app.get("env"));
        console.log("User ID "+userId );
        let payload = {
            custId: userId,
            productID: req.body.id,
            quantity: req.body.qty
        };
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
        let userId = helpers.getUserId(req, app.get("env"));
        let payload = {
            custId: userId,
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
        let userId = helpers.getUserId(req, app.get("env"));
        if(userId=="") {
            return res.status(400).send("no user logged in");
        }
        let payload={
            custId : userId
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
        let userId = helpers.getUserId(req, app.get("env"));
        let body, statusCode;
        let payload={
            custId: userId,
            productID: parseInt(req.params.id)
        }
        if (req.params.id) {
            grpc_client.deleteItem(payload, {}, (err, result) => {
                if (err){
                    body=JSON.stringify(err.details);
                    statusCode=500;//Internal Error
                }else{
                    //console.log(products);
                    body=JSON.stringify(result);
                    statusCode=200;//Successful
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


    module.exports = app;
}());

