(function (){
    'use strict';
    const grpc = require("grpc");
    const protoLoader = require("@grpc/proto-loader");
    const path = require("path");
    const app={};
    const OrdersHost = process.env.OrdersHost || 'localhost:3004'
    const PROTO_FILE_PATH = path.join(__dirname, '..', '..','..', 'idl', 'orders.proto')
    const packageDefinition = protoLoader.loadSync(PROTO_FILE_PATH, {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    //Create gRPC client
    var grpc_client = new protoDescriptor.ordersPackage.OrdersService(
        OrdersHost,
        grpc.credentials.createInsecure()
    );
    /*=====================RPC Calls=====================*/
  app.addOrder= function(custCart,callback){
      grpc_client.addOrder(custCart, {}, (err,status) => {
      if (err){
        callback({status:"fail"},err.details);
      }else{
        callback(status,null);
      }
    });
  };

  module.exports = app;
}());




