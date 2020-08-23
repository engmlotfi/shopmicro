//Service dependencies
const express = require("express");
const users = require("./stub/users");
const catalogue = require("./stub/catalogue");
const morgan = require("morgan");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const ordersServer = new grpc.Server();
const PROTO_FILE_PATH = path.join(__dirname, "..", "idl", "orders.proto");
const packageDefinition = protoLoader.loadSync(PROTO_FILE_PATH,  {keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const mysql = require('mysql');
const DB_HOST = process.env.DB_HOST || 'localhost';
const SERVER_PORT = process.env.PORT || 3004;
//TODO : Move cart to DB
const db = mysql.createConnection({
    host:     DB_HOST,
    user:     'root',
    password: 'Micro@123',
    database: 'shop'
});
//gRPC Mapping
ordersServer.bind(`0.0.0.0:${SERVER_PORT}`, grpc.ServerCredentials.createInsecure());
ordersServer.addService(protoDescriptor.CatalogueService.service,
    {

        "getProducts": getProducts,
        "getProduct": getProduct,
        "createProduct": createProduct,
        //TODO : Full CRUD
        "deleteProduct": deleteProduct,
        /*        "updateProduct": updateProduct*/
    });
//start the grpc server
ordersServer.start();
console.log('Service started at port: ' + SERVER_PORT);

app.use(morgan('combined'));
app.use(morgan("dev", {}));
app.use(bodyParser.json());

//app.use(morgan("dev", {}));
/*=====================Microservice Methods=====================*/

//Add product to the database
function doAddOrder(call, callback)
{
    var user_id = call.request.customer_id;
    var cart = call.request.items;
    user.getRole(user_id,(role,err)=> {
        if (err) {
            callback(err, null);
            return;
        }
        if (role.role != "customer") {
            callback("Invalid Customer login", null);
            return;
        }
 //check price/quantities/ payment method
        var total_price=0;
        async.each(cart, function(item,callback){
            inventory.getProduct(item.product_id,(product,err)=>{
                if(err){
                    console.log(err)
                }else{
                    console.log(product)
                }
                total_price +=item.quantity * product.price;
                callback();
            })
        }, function (err){
            //callback(null, {items: newCart});
            console.log(total_price);
            payload={customer_id:user_id,
                total_price:total_price}
            createOrder(payload,function(ordernum,err) {
                if (!err) {
                    async.each(cart, function(item,next){
                        var query = "INSERT INTO OrderDetails (" +
                            "order_id, " +
                            "product_id, " +
                            "quantity)" +
                            "VALUES(?, ?, ?)";
                        db.query(
                            query,
                            [ordernum, item.product_id, item.quantity],
                            function (err, result) {
                                if (err) {
                                    next({message: 'Error inserting products into database'});
                                    //throw err;
                                }
                                next(null);
                            }
                        );

                    }, function (err){
                        console.log(err);
                        if (err)
                            callback(err,{status: "fail"});
                        else
                            callback(null,{status: "success"});
                    })
                }else
                    callback(err,{status: "fail"});
            })
        })


    });
}

function createOrder(data, callback){

    var query ="INSERT into Orders (customer_id, " +
        "saledate, " +
        "total_price) " +
        "values ('"+ data.customer_id +
        "',CURRENT_TIME()," +
        data.total_price +");";
    db.query(
        query,
        function (err, results) {
            if (err) {
                callback(null,{message: 'Error inserting orders into database'});
                return;
                //throw err;
            }
            //TODO get the order number
            callback(results.insertId,null);
        }
    );
}


function doGetOrders(call,callback){
    var customer_id=call.request.customer_id;
    var query = "SELECT * FROM Orders where customer_id='"+ customer_id +"'";
    db.query(
        query,
        [],
        function(err, rows) {
            if (err) {
                callback({message:'Error accessing orders database'},null);
                //throw err;
            }
            if (rows.length>0){
                callback(null, {orders:rows});
            }else{
                callback({message:'That customer does not have orders'},null);
            }
        }
    );
}

function doGetOrder(call,callback){
    var order_id=call.request.id;
    var query = "SELECT * FROM OrderDetails where order_id='"+ order_id +"'";
    db.query(
        query,
        [],
        function(err, rows) {
            if (err) {
                callback({message:'Error accessing orders database'},null);
                //throw err;
            }
            if (rows.length>0){
                var order_details=[];
                async.each(rows, function(item,callback){
                    var order_item= {product_id:item.product_id,
                        quantity:item.quantity};
                    inventory.getProduct(item.product_id,(product,err)=>{
                        if(err){

                        }else{
                            order_item.name=product.name;
                            order_item.price = product.price,
                                order_item.image=product.image;
                        }
                        order_details.push(order_item);
                        callback();
                    })
                }, function (err){
                    callback(null, {items:order_details});
                })

            }else{
                callback({message:'That order does not have items'},null);
            }
        }
    );
}
