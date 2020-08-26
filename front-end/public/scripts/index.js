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
    $.ajax({
        dataType: "json",
        url: "/getProducts",
        success: function (data) {
            displayProducts(data, "products");
        },
        error: function (jqXHR, exception) {
            var msg = 'Error [' + jqXHR.status + '] :' + jqXHR.statusText +
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
    var num = document.getElementById(fieldname).value;
    var dat = {
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
    let cookieArray = decodedCookie.split(';');
    for(let i = 0; i <cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, c.length);
        }
    }
    return "";
}

function accessRefresher() {
    let role = getCookie('userRole');
    let name = getCookie('userName');
    $('.customerClass').hide();
    $('.admin').hide();
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
/*        $("#logonmessage").text('Logged out');
        $('#loginButton').text('Login');*/
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
            out += '<td>' + products[i].price + '</td>';
            out += '<td> <img src="';
            out += "images/" + products[i].image + '" style="width:104px;height:100px;">';
            out += '<td>' + 'quantity <input type="text" value="1" name="';
            out += 'quantity' + i + '" id="quant' + i
            out += '">' + '</td>';

            out += '<td> <button onclick="addToCart(' + products[i].productID;
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
            out += '<td>' + cart[i].price + '</td>';
            out += '<td> <img src="';
            out += "images/" + cart[i].image + '" style="width:104px;height:100px;">';
            out += '<td> <button onclick="deleteCartItem(' + cart[i].cartid;
            out1 = ")" + '">Delete</button></td>';
            out += out1;
            out += '<td>' + cart[i].quantity + '</td>';
            out += '<td>' + cart[i].price * cart[i].quantity + '</td>';
            out += "</tr>";
            total += cart[i].price * cart[i].quantity;
        }
        out += "</table>";
        out += "<br>";
        out += "<h2>Total: " + total + '</h2><br>';
        out += '<button onclick="checkout()">Checkout</button><br>';
        out += '<div id="cartmessage"></div>';
        document.getElementById(name).innerHTML = out;
    }



//displayProducts(productsData,"products");