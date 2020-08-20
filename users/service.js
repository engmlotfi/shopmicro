//Service dependencies
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const usersService = new grpc.Server();
const PROTO_FILE_PATH = path.join(__dirname, "..", "proto", "users.proto");
const packageDefinition = protoLoader.loadSync(PROTO_FILE_PATH, {});
const grpcObject = grpc.loadPackageDefinition(packageDefinition);
const mysql = require('mysql');
const DB_HOST = process.env.DB_HOST || 'localhost';
const SERVER_PORT = process.env.PORT || 3001;
const db = mysql.createConnection({
    host:     DB_HOST,
    user:     'root',
    password: 'Micro@123',
    database: 'shop'
});
//gRPC Mapping
usersService.addService(grpcObject.UsersService.service,
    {
        "loginUser": loginUser,
        "createUser" : createUser ,
        "updateUser" : updateUser ,
        "deleteUser" : deleteUser ,
        "getUser": getUser ,
        "getUsers": getUsers,
        "getRole":getRole
    });

usersService.bind(`0.0.0.0:${SERVER_PORT}`, grpc.ServerCredentials.createInsecure());

//start the grpc server
usersService.start();
console.log('Service started at port: ' + SERVER_PORT);

/*=====================Microservice Methods=====================*/

function loginUser(call, callback) {
    console.log("user Login ");
        let query = "SELECT * FROM users where name='"+call.request.name+"' and password ='"+call.request.password +"'";
        db.query(query,[],function(err, rows) {
                if (err) {
                    callback({message:"Database access error"},null);
                    throw err;
                }
                if (rows!=null && rows.length>0) {
                    console.log(" user in database" );
                    callback(null, rows[0]);
                }
                else{
                    console.log(" user or password not correct");
                    callback({message:"user or password not correct"},null)
                }
        });
    }


function getRole(call, callback) {

    let query = "SELECT role FROM users where userID='" + call.request.id + "'";
    db.query(
        query,
        [],
        function (err, rows) {
            if (err) {
                callback({message: "Database access error"}, null);
                throw err;
            }
            if (rows.length > 0) {
                let userRole = rows[0].role;
                callback(null, {role: userRole});
            } else {
                callback({message: "User Id not found"}, null);
            }

        }
    );
}

function createUser(call, callback){
    let payload = {request:{id: call.request.admin_id}};
    getRole(payload,(err,role)=> {
        if (err) {
            callback(err, null);
            return;
        }

        if (role.role != "admin" && call.request.type !="Register" ) {
            callback("You does not have administrator access", null);
            return;
        }
        let newUser = call.request.managedUser;
        if (call.request.role != "admin"){
            newUser.role = "customer"
        }

        let query = "INSERT INTO users (" +
            "password, " +
            "name, " +
            "address, " +
            "role)" +
            "VALUES( ?, ?, ?, ?)";
        db.query(
            query,
            [newUser.password, newUser.name, newUser.address, newUser.role],
            function (err, result) {
                if (err) {
                    if(err.code=="ER_DUP_ENTRY")
                        callback({message: "User already exists"}, null);
                    else
                        callback({message: "Error inserting user into database"}, null);
                    return;
                }
                callback(null, {status: 'success'});
            }
        );
    });

}

function getUser(call, callback){
    let payload = {request:{id: call.request.admin_id}};
    getRole(payload,(err,role)=> {
        if (err) {
            callback(err, null);
            return;
        }

        if (role.role != "admin") {
            callback("You does not have administrator access", null);
            return;
        }
        let query = "SELECT * FROM users WHERE name like'%"+ call.request.name + "%'";
    db.query(
        query,
        [],
        function(err, user) {
            if (err) {
                callback({message:"Database access error"},null);
                throw err;
            }
            callback(null, {user: user});
        }
    );
});
}

function getUsers(call, callback){
    let payload = {request:{id: call.request.admin_id}};
    getRole(payload,(err,role)=> {
        if (err) {
            callback(err, null);
            return;
        }

        if (role.role != "admin") {
            callback("You does not have administrator access", null);
            return;
        }

        let query = "SELECT * FROM users ";
    db.query(
        query,
        [],
        function(err, users) {
            if (err) {
                callback({message:"Database access error"},null);
                throw err;
            }
            callback(null, {users: users});
        }
    );
    });

}

function updateUser(call, callback){
    let payload = {request:{id: call.request.admin_id}};
    getRole(payload,(err,role)=> {
        if (err) {
            callback(err, null);
            return;
        }

        if (role.role != "admin") {
            callback("You does not have administrator access", null);
            return;
        }
        let user = call.request.managedUser;
        let query = "UPDATE users SET " +
            "password = '" + user.password + "', '"+
            "name = '" + user.name + "', '" +
            "address = '" + user.address + "', '"+
            "role = '" + user.role + "' WHERE userID='" + user.id + "';" ;
        db.query(+
            query,
            [user.password, user.name, user.address, user.role],
            function (err, result) {
                if (err) {
                    callback({message: err.code + "Error inserting user into database"}, null);
                    return;
                }
                callback(null, {status: "success"});
            }
        );
    });

}

function deleteUser(call, callback){
    let payload = {request:{id: call.request.admin_id}};
    getRole(payload,(err,role)=> {
        if (err) {
            callback(err, null);
            return;
        }
        if (role.role != "admin") {
            callback("You does not have administrator access", null);
            return;
        }
        let query = "DELETE FROM users where userID='" + call.request.id +"';";
        db.query(
            query,
            [],
            function (err, data) {
                if (err) {
                    callback({message:"Database access error"},null);
                    //throw err;
                }
                if (data.affectedRows > 0) {
                    callback(null, {status: "success"});
                } else {
                    callback({message: "User does not exist"}, null);
                }
            }
        );
    });

}




