(function (){
  'use strict';

  var async     = require("async")
    , express   = require("express")
    , request   = require("request")
    , helpers   = require("../../helpers")
    , endpoints = require("../endpoints")
    , app       = express()

  // List items in cart for current logged in user.
 /* app.get("/cart", function (req, res, next) {

    var custId = helpers.getCustomerId(req, app.get("env"));
    console.log("Request received: " + req.url + ", " + custId);
    console.log("Customer ID: " + custId);
    var options = {
      uri: endpoints.cartsUrl + "/cart",
      method: 'GET',
      json: true,
      body: {custId: custId}
    };
    console.log("GET cart: "
        + options.uri + " body: " + JSON.stringify(options.body));
    console.log("GET cart: "
        +  " options: " + JSON.stringify(options));

    request(options,
    function (error, response, body) {
      if (error) {
        return next(error);
      }
      console.log('body '+JSON.stringify(body));
      helpers.respondStatusBodyJSON(res, response.statusCode, body)
    });
  });
*/

  app.get("/cart", function (req, res, next) {
    console.log("Request received: " + req.url + ", " + req.query.custId);
    var custId = helpers.getCustomerId(req, app.get("env"));
    console.log("Customer ID: " + custId);
    request(endpoints.cartsUrl + "/cart/" + custId+"/items",
        function (error, response, body) {
      if (error) {
        return next(error);
      }
      helpers.respondStatusBody(res, response.statusCode, body)
    });
  });

  // Delete cart
  app.delete("/cart", function (req, res, next) {
    var custId = helpers.getCustomerId(req, app.get("env"));
    console.log('Attempting to delete cart for user: ' + custId);
    var options = {
      uri: endpoints.cartsUrl + "/" + custId,
      method: 'DELETE'
    };
    request(options, function (error, response, body) {
      if (error) {
        return next(error);
      }
      console.log('User cart deleted with status: ' + response.statusCode);
      helpers.respondStatus(res, response.statusCode);
    });
  });

  // Delete item from cart
  app.delete("/cart/:id", function (req, res, next) {
    if (req.params.id == null) {
      return next(new Error("Must pass id of item to delete"), 400);
    }

    console.log("Delete item from cart: " + req.url);

    var custId = helpers.getCustomerId(req, app.get("env"));

    var options = {
      uri: endpoints.cartsUrl + "/" + custId + "/items/" + req.params.id.toString(),
      method: 'DELETE'
    };
    request(options, function (error, response, body) {
      if (error) {
        return next(error);
      }
      console.log('Item deleted with status: ' + response.statusCode);
      helpers.respondStatus(res, response.statusCode);
    });
  });

  // Add new item to cart
  app.post("/cart", function (req, res, next) {
    console.log("Attempting to add to cart: " + JSON.stringify(req.body));

    if (req.body.id == null) {
      next(new Error("Must pass id of item to add"), 400);
      return;
    }

    var custId = helpers.getCustomerId(req, app.get("env"));
    var qty = req.body.qty;
    async.waterfall([
        function (callback) {
          var options = {
            uri: endpoints.catalogueUrl + "/getProduct",
            method: 'GET',
            json: true,
            body: {id: req.body.id}
          };
          console.log("GET product: "
              + options.uri + " body: " + JSON.stringify(options.body));

          request(options,
              function (error, response, body) {
            console.log(body);
                console.log(" product id "+body.productID);
            callback(error, body);
          });
        },
        function (item, callback) {
          var options = {
            uri: endpoints.cartsUrl + "/add",
            method: 'POST',
            json: true,
            body: {custId: custId,
              productID : item.productID,
              price: item.price,
              quantity : qty,
              image : item.image,
              name : item.name
            }
          };
          console.log("POST to carts: " + options.uri

              + " body: " + JSON.stringify(options.body));
          request(options, function (error, response, body) {
            if (error) {
              callback(error)
                return;
            }
            callback(null, response.statusCode);
          });
        }
    ], function (err, statusCode) {
      if (err) {
        return next(err);
      }
      if (statusCode != 201) {
        return next(new Error("Unable to add to cart. Status code: " + statusCode))
      }
      helpers.respondStatus(res, statusCode);
    });
  });

  module.exports = app;
}());
