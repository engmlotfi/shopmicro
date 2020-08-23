(function (){
    'use strict';
    const grpc = require("grpc");
    const protoLoader = require("@grpc/proto-loader");
    const path = require("path");
    const app={};
    const UsersHost = process.env.UsersHost || 'localhost:3001'
    const PROTO_FILE_PATH = path.join(__dirname, '..', '..','..', 'idl', 'users.proto')
    const packageDefinition = protoLoader.loadSync(PROTO_FILE_PATH, {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
    //Create gRPC client
    var grpc_client = new protoDescriptor.users.UsersService(
        UsersHost,
        grpc.credentials.createInsecure()
    );
    /*=====================RPC Calls=====================*/
    app.getRole=function (id,callback)
        {
            var payload = {id: id};
            grpc_client.getRole(payload, {}, (err, role) => {
                if (err) {
                    //console.log("Error with log in: " + err.details);
                    callback(null,err.details)
                } else {
                    //console.log(role);
                    callback(role,null);
                }
            });
        }
    module.exports = app;
}());

