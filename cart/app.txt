var express = require("express")
    , morgan = require("morgan")
    , path = require("path")
    , bodyParser = require("body-parser")

    , app = express();


app.use(morgan('combined'));
app.use(morgan("dev", {}));
app.use(bodyParser.json());

//app.use(morgan("dev", {}));
var cart = [];

app.post("/add", function (req, res, next) {
    var obj = req.body;
    console.log("add ");
    console.log("Attempting to add to cart: " + JSON.stringify(req.body));


    //  var obj = JSON.parse(body);

    //       console.log('addToCart id '+id)
    var max = 0;
    var ind = 0;
    if (cart["" + obj.custId] === undefined)
        cart["" + obj.custId] = [];
    var c = cart["" + obj.custId];

    const found = c.some(item => item.name === obj.name);
    if(found){
        var index = c.findIndex(item => item.name === obj.name);
        c[index].price = obj.price;
        c[index].quantity = parseInt(c[index].quantity) + parseInt(obj.quantity);
    }
    else {
        for (ind = 0; ind < c.length; ind++)
            if (max < c[ind].cartid)
                max = c[ind].cartid;
        var cartid = max + 1;
        var data = {
            "cartid": cartid,
            "productID": obj.productID,
            "name": obj.name,
            "price": obj.price,
            "image": obj.image,
            "quantity": obj.quantity
        };
        console.log(JSON.stringify(data));
        c.push(data);
    }

    res.status(201);

    res.send("");


});

app.delete("/cart/:custId/items/:id", function (req, res, next) {
    var body = '';
    console.log("Delete item from cart: for custId " + req.url + ' ' +
        req.params.id.toString());
    console.log("delete item");
    cart[req.params.custId].splice(req.params.id-1,1);
    res.send('Item deleted from the cart');


});


app.get("/cart/:custId/items", function (req, res, next) {


    var custId = req.params.custId;
    console.log("getCart" + custId);


    console.log('custID ' + custId);


    console.log(JSON.stringify(cart["" + custId], null, 2));

    res.send(JSON.stringify(cart["" + custId]));
    console.log("cart sent");

});

app.get("/cart/:custId/items/:id", function (req, res, next) {


    var custId = req.params.custId;
    var id = req.params.id - 1;
    console.log("getCart" + custId);


    console.log('custID ' + custId);
    console.log('itemID ' + id);
    var c = cart["" + custId];
    console.log(JSON.stringify(c["" + id], null, 2));

    res.send(JSON.stringify(c["" + id]));
    console.log("item sent");

});


var server = app.listen(process.env.PORT || 3003, function () {
    var port = server.address().port;
    console.log("App now running in %s mode on port %d", app.get("env"), port);
});
