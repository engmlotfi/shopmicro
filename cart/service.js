//Service dependencies
const users = require("./stub/users");
const catalogue = require("./stub/catalogue");
const orders = require("./stub/orders");
const path = require("path");
const bodyParser = require("body-parser");
const grpc = require("grpc");
const async = require("async");
const protoLoader = require("@grpc/proto-loader");
const cartsServer = new grpc.Server();
const PROTO_FILE_PATH = path.join(__dirname, "..", "idl", "cart.proto");
const packageDefinition = protoLoader.loadSync(PROTO_FILE_PATH,  {keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const mysql = require('mysql');
const DB_HOST = process.env.DB_HOST || 'localhost';
const SERVER_PORT = process.env.PORT || 3003;
//TODO : Move cart to DB
const db = mysql.createConnection({
    host:     DB_HOST,
    user:     'root',
    password: 'Micro@123',
    database: 'shop'
});
//gRPC Mapping
cartsServer.bind(`0.0.0.0:${SERVER_PORT}`, grpc.ServerCredentials.createInsecure());
cartsServer.addService(protoDescriptor.cartPackage.CartService.service,
    {
        "addItem": addItem,
        "deleteItem" : deleteItem ,
        "getItems" : getItems ,
        "checkOut": checkOut
    });
//start the grpc server
var carts = [];
cartsServer.start();
console.log('Service started at port: ' + SERVER_PORT);



/*=====================Microservice Methods=====================*/

function addItem(call, callback) {


    let obj = call.request;
    console.log("add ");
    console.log("Attempting to add to cart: " + JSON.stringify(call.request));

    //  var obj = JSON.parse(body);
    //       console.log('addToCart id '+id)
    var max = 0;
    var ind = 0;
    if (carts["" + obj.custId] === undefined){
        carts["" + obj.custId] = [];
    }
    var c = carts["" + obj.custId]; //Create a cart

    const found = c.some(item => item.productID === obj.productID);
    if(found){
        var index = c.findIndex(item => item.productID === obj.productID);
        c[index].quantity = parseInt(c[index].quantity) + parseInt(obj.quantity);
    }
    else {
        for (ind = 0; ind < c.length; ind++)
            if (max < c[ind].cartId)
                max = c[ind].cartId;
        var cartId = max + 1;
        var data = {
            "cartId": cartId,
            "productID": obj.productID,
            "quantity": obj.quantity
        };
        console.log(JSON.stringify(data));
        c.push(data);
    }

    callback(null,{ status: "success" });

}

function deleteItem(call, callback){
    console.log("Delete item from cart: for custId " + call.request.custId + " " + call.request.itemId.toString() + " ");
    console.log("delete item");
    cart[call.request.custId].splice(call.request.itemId-1,1);
    callback(null,{ status: "success" });

}

function getItems(call, callback){
    let custId = call.request.custId;
    let customerCart = carts[custId];
    var cartObj = [];
    console.log("getCart" + custId);
    console.log('custID ' + custId);
    async.each(customerCart, function(item,callback){
        var newItem= {productID:item.productID,
            quantity:item.quantity};
        catalogue.getProduct(item.productID,(product,err)=>{
            if(err){
            console.log("Product not found " + JSON.stringify(err));
            throw err;
            }else{
                console.log("Product found");
                newItem.name=product.name;
                newItem.price = product.price;
                newItem.image=product.image;
            }
            cartObj.push(newItem);
            callback();
        })
    }, function (err){
        console.log(JSON.stringify(cartObj, null, 2));
        console.log("cart sent");
        callback(null, {items: cartObj});
    })

}


function checkOut(call,callback){
    let custId=call.request.custId;
    users.getRole(custId,(role,err)=> {
        if (err) {
            callback(err, null);
            return;
        }

        if (role.role != "customer") {
            callback("Invalid customer", null);
            return;
        }
/*        if (cart[custId] === undefined) {
            callback(null, {status: 'this customer does not have a cart'});
            return;
        }*/

        var payload={custId: custId,
            items: carts[custId]};
        orders.addOrder(payload,function (status,err){
            if(status.status=="success"){
                delete carts[custId];
                callback(null,status);
            } else {
                callback("Order creation failed",status);
            }
        })
    });
}