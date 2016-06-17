function initialize()  {
    var mapProp = {
        center : new google.maps.LatLng(50.464379, 30.519131),
        zoom : 11
    };
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
    
    
    var html_element = document.getElementById("googleMap");
    var map = new google.maps.Map(html_element, mapProp);
    
    directionsDisplay.setMap(map);
    function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  directionsService.route({
    origin: homeMarker.point,
    destination: marker.position,
    travelMode: google.maps.TravelMode.DRIVING
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

    var point = new google.maps.LatLng(50.464379, 30.519131);
    var marker = new google.maps.Marker({
        position : point,
        map : map,
        icon : "assets/images/map-icon.png"
    });
    
    var homeMarker = new google.maps.Marker({
        position : point,
        //map : map,
        //icon : "assets/images/map-icon.png"
        icon : "assets/images/home-icon.png"
    });

    console.log("123");
    console.log(homeMarker);

    function geocodeLatLng(latlng, callback) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            'location': latlng
        }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK && results[1]) {
                var adress = results[1].
                formatted_address;
                callback(null, adress);
            } else {
                callback(new Error("Can't find adress "));
            }
        });
    }

    function geocodeAddress(address, callback) {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            'address': address
        }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
                var coordinates = results[0].geometry.location;
                callback(null, coordinates);
            } else {
                callback(new Error("Can not find the adress "));
            }
        });
    }

    function    calculateRoute(A_latlng, B_latlng, callback)   {
        var directionService =  new google.maps.DirectionsService();
        directionService.route({
            origin: A_latlng,
            destination:    B_latlng,
            travelMode: google.maps.TravelMode["DRIVING"]
        },
        function(response,  status) {
            if  (status  ==  google.maps.DirectionsStatus.OK )   {
                var leg  =   response.routes[0].legs[0];
                console.log(leg.duration.text);
                callback(null,  {duration:leg.duration});
                directionsDisplay.setDirections(response);
            }
            else{
                callback(new    Error("Can not find direction"));
            }
        });
    }

    google.maps.event.addListener(map, 'click',function(me){
        geocodeLatLng(me.latLng, function(err, adress){
            if (err){
                $(".address-group").addClass("has-error");  
                $(".address-group").removeClass("has-success");
            } else {
                //var homePoint = new google.maps.LatLng(me.latLng.lat, me.latLng.lng);
                homeMarker.setMap(map);
                homeMarker.position = me.latLng;
                console.log(homeMarker);
                $('#inputAdress').val(adress);
                $('.order-summery-adress').html("<b>Адреса доставки</b>:"+adress);
                $(".address-group").removeClass("has-error");  
                $(".address-group").addClass("has-success");
            }
        });
        console.log(homeMarker);
        console.log(marker);
        calculateRoute(me.latLng,marker.position, function(err, time){
            $(".order-summery-time").html("<b>Приблизний час доставки</b>:"+time.duration.text);
                
        });
    });

//3 15-15

    $('#inputName').on('input', function() {
        var r = /^[А-ЯA-Zа-яa-z]+$/;
        if (r.test($('#inputName').val())) {
            $(".name-help-block").hide();  
            $(".name-group").removeClass("has-error");  
            $(".name-group").addClass("has-success");  
        } else {
            $(".name-help-block").show();
            $(".name-group").addClass("has-error");
            $(".name-group").removeClass("has-success");  
        }
    });

    $('#inputPhone').on('input', function() {
        var r = /^((\+380[0-9]{9})|(0[0-9]{9}))$/;
        if (r.test($('#inputPhone').val())) {
            $(".phone-help-block").hide();
            $(".phone-group").removeClass("has-error");  
            $(".phone-group").addClass("has-success");             
        } else {
            $(".phone-help-block").show();
            $(".phone-group").addClass("has-error");  
            $(".phone-group").removeClass("has-success"); 
        }
    });

    $('#inputAdress').on('input', function() {
        var a = $('#inputAdress').val();
        geocodeAddress(a, function(err, latLng){
            if (err){
                $(".address-help-block").hide();
                $(".address-group").addClass("has-error");  
                $(".address-group").removeClass("has-success");
            } else {
                geocodeLatLng(latLng, function(err, adress){
                    $('#addressFinale').html(adress);
                    $(".address-help-block").hide();
                    $(".address-group").removeClass("has-error");  
                    $(".address-group").addClass("has-success");
                });
            }
        });
    });
    $('#make-order').click(function(){

    });

     var request;
    // Bind to the submit event of our form
    $("#norm").submit(function(event){
        // Abort any pending request
        if (request) {
            request.abort();
        }
        // setup some local variables
        var $form = $(this);
        $("#priceInput").val($("#total-price").html());
        
        // Let's select and cache all the fields
        var $inputs = $form.find("input, select, button, textarea");
        // Serialize the data in the form
        var serializedData = $form.serialize();
        // Let's disable the inputs for the duration of the Ajax request.
        // Note: we disable elements AFTER the form data has been serialized.
        // Disabled form elements will not be serialized.
        $inputs.prop("disabled", true);
        // Fire off the request to /form.php
        request = $.ajax({
            url: "/api/create-order/",
            type: "post",
            data: serializedData
        });
        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            // Log a message to the console
            console.log("Hooray, it worked!");
            console.log(response);
            if (response.success){
                //window.location = response.link;

    
                LiqPayCheckout.init({
                data: response.data,
                signature: response.sign,
                embedTo: "#liqpay_checkout",
                mode: "popup" // embed || popup
                }).on("liqpay.callback", function(data){
                    console.log(data.status);
                    console.log(data);
                }).on("liqpay.ready", function(data){
                    // ready
                }).on("liqpay.close", function(data){
                    // close
            });

            }
        });
        // Callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error(
                "The following error occurred: "+
                textStatus, errorThrown
            );
        });
        // Callback handler that will be called regardless
        // if the request failed or succeeded
        request.always(function () {
            // Reenable the inputs
            $inputs.prop("disabled", false);
        });
        // Prevent default posting of form
        event.preventDefault();
    });
    $('.next-step-button').click(function(){
        if ($(".address-group").hasClass("has-success") && $(".phone-group").hasClass("has-success") && $(".name-group").hasClass("has-success")){ 
            $("#norm").submit();
        } else {
            //checkAdress();
            //checkPhone();
            //checkName();
        }
    });
}



google.maps.event.addDomListener(window, 'load', initialize);
