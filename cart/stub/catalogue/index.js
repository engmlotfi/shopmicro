(function (){
    'use strict';
    const grpc = require("grpc");
    const protoLoader = require("@grpc/proto-loader");
    const path = require("path");
    const app={};
    const CatalogueHost = process.env.CatalogueHost || 'localhost:3002'
    const PROTO_FILE_PATH = path.join(__dirname, '..', '..','..', 'idl', 'catalogue.proto')
    const packageDefinition = protoLoader.loadSync(PROTO_FILE_PATH, {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    //Create gRPC client
    var grpc_client = new protoDescriptor.cataloguePackage.CatalogueService(
        CatalogueHost,
        grpc.credentials.createInsecure()
    );
    /*=====================RPC Calls=====================*/
    app.getProduct= function(id,callback){
        console.log("getProduct from Carts Microservice");
        const payload = { id: id};
        grpc_client.getProduct(payload, {}, (err, product) => {
            if (err){
                callback(null,JSON.stringify(err.details));
            }else{
                callback(product,null);
            }
        });
    };

    module.exports = app;
}());




