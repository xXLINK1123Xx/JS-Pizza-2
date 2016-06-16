/**
 * Created by chaika on 02.02.16.
 */
var Templates = require('../Templates');

//Перелік розмірів піци
var PizzaSize = {
    Big: "big_size",
    Small: "small_size"
};

//Змінна в якій зберігаються перелік піц в кошику
var Cart = [];
var cart_map = [];
var count = 0;
var price = 0;

//HTML едемент куди будуть додаватися піци
var $cart = $("#cartList");

function addToCart(pizza, size) {

    var cart_id = cart_map[pizza.id];

    if (cart_id && (cart_id[size] || cart_id[size] === 0)){
            Cart[cart_id[size]].quantity += 1;
            
    } else {
        if (!cart_map[pizza.id]){
            cart_map[pizza.id] = [];
        }
        cart_map[pizza.id][size] = 
        Cart.push({
            pizza: pizza,
            size: size,
            quantity: 1
        }) - 1;
    }

    //Оновити вміст кошика на сторінці
    updateCart();
}

function removeFromCart(cart_item) {
    //Видалити піцу з кошика
    //TODO: треба зробити

    if (cart_item.cart_id){
        Cart.splice(cart_item.cart_id, 1);
        console.log("Cart length rem = "+Cart.length);
            
    }

    //Після видалення оновити відображення
    updateCart();
}

function initialiseCart() {
    //Фукнція віпрацьвуватиме при завантаженні сторінки
    //Тут можна наприклад, зчитати вміст корзини який збережено в Local Storage то показати його
    //TODO: ...
    var cart = localStorage.getItem("cart");
    if (cart) 
        Cart = JSON.parse(cart);

    $("#clear").click(clearCart);


    updateCart();
}

function clearCart(){
    Cart = [];
    cart_map = [];

    
    updateCart();
    count = 0;
    price = 0;

    $("#count").html(count);
}

function getPizzaInCart() {
    //Повертає піци які зберігаються в кошику
    return Cart;
}

function updateCart() {
    //Функція викликається при зміні вмісту кошика
    //Тут можна наприклад показати оновлений кошик на екрані та зберегти вміт кошика в Local Storage

    //Очищаємо старі піци в кошику
    $cart.html("");

    price = 0;

    //Онволення однієї піци
    function showOnePizzaInCart(cart_item, id, arr) {
        var html_code = Templates.PizzaCart_OneItem(cart_item);

        cart_item.cart_id = id;

        var $node = $(html_code);

        $node.find(".plus").click(function(){
            //Збільшуємо кількість замовлених піц
            cart_item.quantity += 1;
            count +=1;
            //price += cart_item.pizza.price;
            //Оновлюємо відображення
            updateCart();
        });

        $node.find(".minus").click(function(){
            
            if (cart_item.quantity > 1){
                cart_item.quantity -= 1;
                count -=1;


                //price -= cart_item.pizza.price;
            }
            else{
                count -= cart_item.quantity;
                console.log(count);
                $("#count").html(count);
                arr.splice(id, 1);
                
            }
            if(count < 1) $('#make-order').attr("disabled", true);
                else $('#make-order').attr("disabled", false);
            //Оновлюємо відображення
            updateCart();
        });


        $node.find(".count-clear").click(function(){
             
            count -= cart_item.quantity;
            console.log(count);
            $("#count").html(count);
             arr.splice(id, 1);

            updateCart();
        });

        count = 0;

        if(Cart.length != 0){
            console.log("Cart length = "+Cart.length);
            Cart.forEach(function(pizza){
                count += pizza.quantity;
            });
        }
        else count = 0;
        console.log(count);
        console.log("itn");
        console.log(cart_item);
        var localPrice = cart_item.quantity * cart_item.pizza[cart_item.size].price;

        price += localPrice;



        $cart.append($node);
    }

    Cart.forEach(showOnePizzaInCart);

    $("#count").html(count);
    $("#total-price").html(price + " грн.");

    localStorage.setItem("cart", JSON.stringify(Cart));
}

exports.removeFromCart = removeFromCart;
exports.addToCart = addToCart;

exports.getPizzaInCart = getPizzaInCart;
exports.initialiseCart = initialiseCart;

exports.PizzaSize = PizzaSize;