var headers = [
    "Product Name", "Price", "Picture", "Quantity", "Buy Button"];
var Cartheaders = [
    "Product Name", "Price", "Picture", "delete", "Quantity","Total"];
$(document).ready(function () {

});
function getCart() {
    hideAll();
    $("#products").hide();
    $("#cart").show();
    $.ajax({
        dataType: "json",
        url: "/cart",
        success: function (data) {
            displayCart(data, "cart");
        }
    });
}

function getProducts() {
    hideAll();
    $("#products").show();
    $("#cart").hide();
    $("#orders").hide();
    $.ajax({
        dataType: "json",
        url: "/getProducts",
        success: function (data) {
            //alert("Products retrieved: " + JSON.stringify(data)) ;
            displayProducts(data, "products");
            //accessRefresher();
        },
        error: function (jqXHR, exception) {
            let msg = 'Error [' + jqXHR.status + '] :' + jqXHR.statusText +
                '\n' + jqXHR.responseJSON;
            alert(msg)
        }

    });
}

function logout(){
    let fd ='';
        $.ajax
        ({
            type: "POST",
            url: "/logout",
            contentType: 'application/json',
            data: fd,
            success: function (res) {
                console.log(res);
                accessRefresher();
            }
        });
    }

function hideAll(){
    $("#login").hide();
    $("#register").hide();
    $("#newProduct").hide();
    }


function showLogin() {
    hideAll();
    if ($('#loginButton').text()=='Logout'){
        logout();
    }
    else {
        $("#login").show();
    }
}

function showRegister() {
    hideAll();
    $("#register").show();

}
function showNewProduct() {
    hideAll();
    $("#newProduct").show();

}

function addToCart(prodid, fieldname) {
    let num = document.getElementById(fieldname).value;
    num=parseInt(num);
    let dat = {
        id: prodid,
        qty : num
    };
    $.ajax
    ({
        type: "POST",
        url: "/cart",
        contentType: 'application/json',

        //json object to sent to the authentication url
        data: JSON.stringify(dat),
        success: function () {

            alert("Thanks! Item Added to Cart");
        }
    });


}
function checkout() {
    $.post(
        "/checkout",
        {
        },
        function (data) {
            $('#cartmessage').html(data);
            if(data.status=="success")
                alert("Thanks for buying our products");
            else
                alert("Error:\n" + data);
            getCart();
        }
    );

}

function deleteCartItem(count) {

    $.ajax({
        type: "DELETE",
        url: "/cart/" + count.toString() ,
        id: count.toString(),
        success: function () {
            window.alert("Item Deleted");
            getCart();
        }
    });


}

function getCookie(cookieParam) {
    let name = cookieParam + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    console.log(decodedCookie);
    let cookieArray = decodedCookie.split(';');
    for(let i = 0; i <cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }
    return "";
}

function accessRefresher() {
    let role = getCookie('userRole');
    let name = getCookie('userName');
    console.log("User Name = "+ name + " User Role = "+ role)
    $('.customerClass').hide();
    $('.adminClass').hide();
    if (role) {
        $("#logonmessage").text('Logged in as ' + role + ' (' + name + ')');
        $('#loginButton').text('Logout');
        if (role == "admin")
            $('.adminClass').show();
        else if (role == "customer")
            $('.customerClass').show();
    } else {
        $("#logonmessage").text(role );
        $("#logonmessage").text(name);
        $("#logonmessage").text('Logged out');
        $('.customerClass').hide();
        $('.adminClass').hide();
        $('#loginButton').text('Login');
    }
}


/*
    function myFunction(itemNo) {
        str = JSON.stringify(products[itemNo]);
        window.alert("You selected " + str);
    }
*/

    function displayProducts(products, name) {
        var out = "<table border=1 width=100%>";
        var i;
        out += '<tr style="font-size: 20px;" >';
        for (i = 0; i < headers.length; i++) {
            out += '<th >' + headers[i] + '</th>';
        }
        out += "</tr>";
        for (i = 0; i < products.length; i++) {
            out += "<tr>";
            out += '<td>' + products[i].name + '</td>';
            out += '<td>' + parseFloat(products[i].price).toFixed(2) + '</td>';
            out += '<td> <img src="';
            out += "images/" + products[i].image + '" style="width:78px;height:75px;">';
            out += '<td>' + '<span class="customerClass">quantity</span> <input class="customerClass" type="text" value="1" name="';
            out += 'quantity' + i + '" id="quant' + i
            out += '">' + '</td>';

            out += '<td> <button onclick="addToCart(' + products[i].productID + ' ';
            out += ",'quant" + i + "')" + '">Buy</button></td>';
            out += "</tr>";
        }
        out += "</table>";
        document.getElementById(name).innerHTML = out;
    }

    function displayCart(cart, name) {
        var out = "<h1> Shopping Cart</h1><table border=1 width=100%>";
        var i;
        out += '<tr style="font-size: 20px;" >';
        for (i = 0; i < Cartheaders.length; i++) {
            out += '<th >' + Cartheaders[i] + '</th>';
        }
        out += "</tr>";
        var total = 0;
        for (i = 0; i < cart.length; i++) {
            out += "<tr>";
            out += '<td>' + cart[i].name + '</td>';
            out += '<td>' + parseFloat(cart[i].price).toFixed(2) + '</td>';
            out += '<td> <img src="';
            out += "images/" + cart[i].image + '" style="width:78px;height:75px;">';
            out += '<td> <button onclick="deleteCartItem(' + cart[i].cartid;
            out1 = ")" + '">Delete</button></td>';
            out += out1;
            out += '<td>' + cart[i].quantity + '</td>';
            out += '<td>' + parseFloat(cart[i].price).toFixed(2) * cart[i].quantity + '</td>';
            out += "</tr>";
            total += parseFloat(cart[i].price).toFixed(2) * cart[i].quantity;
        }
        out += "</table>";
        out += "<br>";
        out += "<h2>Total: " + total + '</h2><br>';
        out += '<button onclick="checkout()">Checkout</button><br>';
        out += '<div id="cartmessage"></div>';
        document.getElementById(name).innerHTML = out;
    }

function getOrders(customer_id){
    hideAll();
    let url;
    if(customer_id){
        url="/orders/" + customer_id
    }else{
        url="/orders"
    }
    $.ajax({
        dataType: "json",
        url: url,
        success: function (data) {
            displayOrders(data, customer_id,"orders");
            $("#cart").hide();
            $("#products").hide();
            $("#orders").show();
        },
        error: function (jqXHR, exception) {
            var msg = 'Error ['+ jqXHR.status + '] :' + jqXHR.statusText+
                '\n' + jqXHR.responseJSON;
            alert(msg);
            $("#orders").hide();
        }
    });
}

function getOrderDetails(orderId) {

    $.ajax({
        dataType: "json",
        url: "/order/" +  orderId,
        success: function (data) {
            displayOrderDetails(data.items, orderId);
        }
    });
}
function displayOrders(orders,customer_id, name) {
    var out;
    var i;
    if(customer_id){
        out = "<h1> "+ customer_id + " Orders</h1><table>";
    }else{
        out = "<h1> My Orders</h1><table>";
    }

    out += '<tr>';
    for (i = 0; i < Orderheaders.length; i++) {
        out += '<th >' + Orderheaders[i] + '</th>';
    }
    out += "</tr>";
    for (i = 0; i < orders.length; i++) {
        out += "<tr>";
        out += '<td>' + orders[i].id + '</td>';
        out += '<td>' + formatDate(orders[i].saledate) + '</td>';
        out += '<td>' + orders[i].total_price + '</td>';
        out += '<td>' + orders[i].status + '</td>';
        out += '<td> <button onclick="getOrderDetails(' + orders[i].id + ')">Display Details</button></td>';
        out += "</tr>";
        out += "<tr> <td colspan='5' id='orderDetails" +orders[i].id+ "'> </td>";
    }

    out += "</table>";
    out += "<br>";
    $("#"+ name).html(out);
    currentDisplayedOrders=orders;
    for (i = 0; i < orders.length; i++) {
        $("#orderDetails" +orders[i].id).hide();
    }
}

function displayOrderDetails(orderItems, orderId) {
    var i=0;
    for (i = 0; i < currentDisplayedOrders.length; i++) {
        $("#orderDetails" +currentDisplayedOrders[i].id).hide();
    }
    var out = "<table>";
    out += '<tr>';
    for (i = 0; i < orderDetailheaders.length; i++) {
        out += '<th >' + orderDetailheaders[i] + '</th>';
    }
    out += "</tr>";

    for (i = 0; i < orderItems.length; i++) {
        out += "<tr>";
        out += '<td>' + orderItems[i].name + '</td>';
        out += '<td>' + orderItems[i].price + '</td>';
        out += '<td> <img src="images/' + orderItems[i].image + '"></td>';
        out += '<td>' + orderItems[i].quantity + '</td>';
        out += '<td>' + orderItems[i].price* orderItems[i].quantity + '</td>';
        out += "</tr>";
    }
    out += "</table>";
    out += "<br>";
    $("#orderDetails" + orderId).html(out);
    $("#orderDetails" + orderId).show()
}

