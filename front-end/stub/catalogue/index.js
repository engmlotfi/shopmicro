(function (){
    'use strict';
    var express   = require("express")
        , helpers   = require("../../helpers")
        , app       = express()
        , grpc = require("grpc")
        , protoLoader = require("@grpc/proto-loader")
        , qs = require("querystring")
        , path= require("path");
    const CatalogueHost = process.env.CatalogueHost || 'localhost:3002'
    var PROTO_PATH = path.join(__dirname, '..', '..','..', 'idl', 'catalogue.proto');

    //Load the protobuf
    var catalogue_proto = grpc.loadPackageDefinition(
        protoLoader.loadSync(PROTO_PATH, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        })
    );

    //Create gRPC client
    var grpc_client = new catalogue_proto.cataloguePackage.CatalogueService(
        CatalogueHost,
    grpc.credentials.createInsecure()
    );

    // update existing product
    app.post("/updateproduct", function (req, res) {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            var userId = helpers.getUserId(req, app.get("env"));
            if(userId=="") {
                return res.status(400).send("no administrator logged in");
            }
            var product=qs.parse(body);
            var payload = {
                user_id:userId,
                id:product.productId,
                name :product.name,
                quantity :product.quantity,
                price :product.price,
                image :product.image,
            }
            grpc_client.updateProduct(payload, {}, (err, result) => {
                if (err==null){
                    res.status(201).send(result)
                }else{
                    res.status(405).send(err.details)
                }
            });
        });
    });
    // add new product
    app.post("/product", function (req, res) {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            var userId = helpers.getUserId(req, app.get("env"));
            var product=qs.parse(body);
            var payload = {
                admin_id:userId,
                name :product.name,
                quantity :product.quantity,
                price :product.price,
                image :product.image,
            }
            grpc_client.addProduct(payload, {}, (err, result) => {
                if (err==null){
                    res.status(201).send(result)
                }else{
                    res.status(405).send(err.details)
                }
            });
        });
    });
    
    // get all products
    app.get("/getProducts", function (req, res, next) {
        let body, statusCode;
        grpc_client.getProducts({}, {}, (err, products) => {
            if (err) {
                body = JSON.stringify(err.details);
                statusCode = 500;//Internal Error
            } else {
                //console.log(products);
                body = JSON.stringify(products.products);
                console.log(JSON.stringify(body));
                statusCode = 200;//Successful
            }
            res.writeHeader(statusCode);
            res.end(body);
        });

    });

    //get specific product by id
    app.get("/product/:id", function (req, res, next) {
        var body, statusCode;
        if (req.params.id) {
            const payload = { id: parseInt(req.params.id)};
            grpc_client.getProduct(payload, {}, (err, product) => {
                if (err){
                    body=JSON.stringify(err.details);
                    statusCode=500;//Internal Error
                }else{
                    //console.log(products);
                    body=JSON.stringify(product);
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

    // Delete specific product
    app.delete("/product/:id", function (req, res, next) {
        var body, statusCode;
        var userId = helpers.getUserId(req, app.get("env"));
        if (req.params.id) {
            const payload = { admin_id: userId,
                id: parseInt(req.params.id)};
            grpc_client.deleteProduct(payload, {}, (err, result) => {
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
    
    // make the service available for front end
    module.exports = app;
}());