(function (){
  'use strict';
  var express   = require("express")
      , helpers   = require("../../helpers")
      , app       = express()
      , grpc = require("grpc")
      , protoLoader = require("@grpc/proto-loader")
      , qs = require('querystring')
      , path= require("path");
  const OrdersHost = process.env.OrdersHost || 'localhost:3004'
  var PROTO_PATH = path.join(__dirname, '..', '..','..', 'protos', 'orders.proto');
  //Load the protobuf
  var orders_proto = grpc.loadPackageDefinition(
      protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      })
  );

  //Create gRPC client
  var grpc_client = new orders_proto.orders.OrdersService(
      OrdersHost,
      grpc.credentials.createInsecure()
  );

  // get all products
  app.get("/orders", function (req, res, next) {
    var customerId = helpers.getUserId(req, app.get("env"));
    var payload = {
      customer_id: customerId,
    }

    var body, statusCode;
    grpc_client.getOrders(payload, {}, (err, orders) => {
      if (err) {
        body = JSON.stringify(err.details);
        statusCode = 500;//Internal Error
      } else {
        body = JSON.stringify(orders.orders);
        statusCode = 200;//Successfull
      }
      res.writeHeader(statusCode);
      res.end(body);
    });

  });

  app.get("/orders/:customer_id", function (req, res, next) {
    if (req.params.customer_id) {
      var payload = {
        customer_id: req.params.customer_id,
      }

      var body, statusCode;
      grpc_client.getOrders(payload, {}, (err, orders) => {
        if (err) {
          body = JSON.stringify(err.details);
          statusCode = 500;//Internal Error
        } else {
          body = JSON.stringify(orders.orders);
          statusCode = 200;//Successfull
        }
        res.writeHeader(statusCode);
        res.end(body);
      });
    }else {
      body = "Must pass customer ID";
      statusCode = 400;//Bad request Error
      res.writeHeader(statusCode);
      res.end(body);
    }

  });
  //get specific product by id
  app.get("/order/:id", function (req, res, next) {
    var body, statusCode;
    if (req.params.id) {
      const payload = { id: req.params.id};
      grpc_client.getOrder(payload, {}, (err, orderDetails) => {
        if (err){
          body=JSON.stringify(err.details);
          statusCode=500;//Internal Error
        }else{
          //console.log(products);
          body=JSON.stringify(orderDetails);
          statusCode=200;//Successfull
        }
        res.writeHeader(statusCode);
        res.end(body);
      });
    }else {
      body = "Must pass Order ID";
      statusCode = 400;//Bad request Error
      res.writeHeader(statusCode);
      res.end(body);
    }
  });


  // make the service available for front end
  module.exports = app;
}());