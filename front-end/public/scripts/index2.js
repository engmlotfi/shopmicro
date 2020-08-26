$(document).ready(function () {
    $('#logonForm').on( "submit",function(event) {

        event.preventDefault();
        $("#login").hide();

        let o={};
        let a = $('#logonForm').serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        let fd =JSON.stringify(o);
        console.log(fd);
        $.ajax
        ({
            type: "POST",
            url: "/login",
            contentType: 'application/json',
            data: fd,
            success: function (res) {
                console.log(res);
                alert("Welcome Back!");
                accessRefresher();
            },
            statusCode: {
                500: function (res) {
                    let body = JSON.parse(this.data)
                    alert("incorrect User Id and Password " + body.id);
                    accessRefresher();
                }
            }
        });



    });
    $('#registerForm').on( "submit",function(event) {

        event.preventDefault();
        $("#register").hide();
        var o={};
        var a = $('#registerForm').serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        var fd =JSON.stringify(o);
        console.log(fd);
        $.ajax
        ({
            type: "POST",
            url: "/register",
            contentType: 'application/json',
            data: fd,
            success: function () {

                alert("Thanks! User registered successfully");
            }
        });

    });
    $('#newProductForm').on( "submit",function(event) {

        event.preventDefault();
        $("#newProduct").hide();
        var fd = $('#newProductForm').serialize();
        alert("This is event!");
        $.post({
                type: "POST",
                url: "/product",
                contentType: 'application/json',
                data: fd,
                function (data) {
                    console.log(data);
                    $('#newProductForm').html(data);
                }
            }
        );



    });
    getProducts();
    $("#login").hide();
    $('#register').hide();
    $("#newProduct").hide();
});