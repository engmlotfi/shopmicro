//Service dependencies
const users = require("./stub/users");
const path = require("path");
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const catalogueServer = new grpc.Server();
const PROTO_FILE_PATH = path.join(__dirname, "..", "idl", "catalogue.proto");
console.log(PROTO_FILE_PATH);
const packageDefinition = protoLoader.loadSync(PROTO_FILE_PATH,  {keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const mysql = require('mysql');
const DB_HOST = process.env.DB_HOST || 'localhost';
const SERVER_PORT = process.env.PORT || 3002;

const db = mysql.createConnection({
    host:     DB_HOST,
    user:     'root',
    password: 'Micro@123',
    database: 'shop'
});
//gRPC Mapping
catalogueServer.bind(`0.0.0.0:${SERVER_PORT}`, grpc.ServerCredentials.createInsecure());
catalogueServer.addService(protoDescriptor.cataloguePackage.CatalogueService.service,
    {
        "getProducts": getProducts,
        "getProduct": getProduct,
        "createProduct": createProduct,
        //TODO : Full CRUD
        "deleteProduct": deleteProduct,
/*        "updateProduct": updateProduct*/
    });
//start the grpc server
catalogueServer.start();
console.log('Service started at port: ' + SERVER_PORT);

/*=====================Microservice Methods=====================*/

function createProduct(call, callback) {

    let newProduct = call.request;
    let payload = newProduct.admin_id;
    users.getRole(payload,(err,role)=> {
        if (err) {
            callback(err, null);
            return;
        }

        if (role.role != "admin") {
            callback("You does not have administrator access", null);
            return;
        }
    console.log("This is a new product from microservice");
    let query = "SELECT * FROM Products where name='"+newProduct.name+"'";
    db.query(
         query, [],
        function(err, rows) {
             if (err) {
                 callback({"error": "2"}, null);
                    throw err;
                }
                if (rows!=null && rows.length>0) {
                    console.log(" Product already in database");
                    callback({message: "Error Product already in database"}, null);
                }
                else{
                    query = "INSERT INTO Products (name, quantity, price, image)"+
                        "VALUES(?, ?, ?, ?)";
                    db.query(
                        query,
                        [newProduct.name,newProduct.quantity,newProduct.price, newProduct.image],
                        function(err, result) {
                            if (err) {
                                // 2 response is an sql error
                                callback({message: 'Error inserting product into database'}, null);
                                throw err;
                            }
                            else{
                                let product = {id: result.insertId ,
                                    name : newProduct.name ,
                                    quantity: newProduct.quantity ,
                                    price: newProduct.price,
                                    image: newProduct.image};
                                callback(null, product);
                            }

                        }
                    );
                }

            }
        );


    });

}

function deleteProduct(call, callback){
//TODO : delete product
    console.log("delete product");
}

function getProducts(call, callback){
    console.log("getProducts");
    let query = "SELECT * FROM products ";
    db.query(
        query,
        [],
        function(err, rows) {
            if (err) {
                callback({message:"Error accessing catalogue database"},null);
                throw err;
            }
            callback(null, {products: rows});
            //console.log("Products sent " + JSON.stringify(rows));
        }
    );
}


function getProduct(call, callback){
    console.log("getProduct");
    let id=call.request.id;
    let query = "SELECT * FROM products where productID='"+id+"'";
    db.query(
        query,
        [],
        function(err, rows) {
            if (err) {
                callback({message: "Error accessing catalogue database"}, null);
                throw err;
            }
            if (rows.length > 0) {
                callback(null, rows[0]);
            } else {
                callback({message: "Requested product does not exist"}, null);
            }
        });
}