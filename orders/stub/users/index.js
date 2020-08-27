(function (){
    'use strict';
    var grpc = require("grpc")
        , protoLoader = require("@grpc/proto-loader")
        , path=require('path')
        ,app={};
    const UsersHost = process.env.UsersHost || 'localhost:3001'

    var PROTO_PATH = path.join(__dirname, '..', '..','..', 'idl', 'users.proto')
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
    var grpc_users = new users_proto.usersPackage.UsersService(
        UsersHost,
        grpc.credentials.createInsecure()
    );

    app.getRole=function (id,callback)
    {
        var payload = {userID: id};
        grpc_users.getRole(payload, {}, (err, role) => {
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

