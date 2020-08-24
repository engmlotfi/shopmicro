(function (){
    'use strict';
    var  grpc = require("grpc")
        , protoLoader = require("@grpc/proto-loader")
        ,app={}
        , path= require("path");
    const InventoryHost = process.env.InventoryHost || 'localhost:3002'
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
        InventoryHost,
        grpc.credentials.createInsecure()
    );

    app.getProduct= function(id,callback){
        const payload = { id: id};
        grpc_client.getProduct(payload, {}, (err, product) => {
            if (err){
                callback(null,err.details);
            }else{
                callback(product,null);
            }
        });
    };

    module.exports = app;
}());




