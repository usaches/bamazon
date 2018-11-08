var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require('colors');
var Table = require('cli-table');
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "usaches",
    database: "bamazon"
});
connection.connect(function (err) {
    if (err) throw err;
    console.log("Welcome! ...you are now connected to the Bamazon Store database as id " + connection.threadId);
    bamazon();
});
function bamazon() {
    connection.query('SELECT * FROM products', function (err, res) {
        if (err) throw err;
        console.log(res.length)
        var table = new Table(
            {
                head: ["Product ID".cyan.bold, "Product Name".cyan.bold, "Department Name".cyan.bold, "Price".cyan.bold, "Quantity".cyan.bold],
                colWidths: [12, 75, 20, 12, 12],
            });
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, parseFloat(res[i].price).toFixed(2), res[i].stock_quantity]
            );
        }
        console.log(table.toString());
        inquirer.prompt([
            {
                type: "number",
                message: "Which Product ID Number would you like to purchase?".red,
                name: "id"
            },
            {
                type: "number",
                message: "What quantity would you like to purchase?".red,
                name: "quantity"
            },
        ])
            .then(function (cart) {
                var quantity = cart.quantity;
                var itemID = cart.id;
                console.log(itemID);
                console.log(quantity);
                connection.query('SELECT * FROM products WHERE item_id=' + itemID, function (err, selectedItem) {
                    if (err) throw err;
                    if (selectedItem[0].stock_quantity - quantity >= 0) {
                        console.log("Quantity in Store: " + selectedItem[0].stock_quantity + " Requested Quantity: " + quantity);
                        console.log("Order of " + selectedItem[0].product_name + " successful!");
                        console.log("Thank You for your purchase. Your order total will be $" + (cart.quantity * selectedItem[0].price).toFixed(2));
                        connection.query('UPDATE products SET stock_quantity=? WHERE item_id=?', [selectedItem[0].stock_quantity - quantity, itemID],
                            function (err, inventory) {
                                if (err) throw err;
                                return;
                            });
                    }
                    else {
                        console.log("Insufficient Stock! Please try again!");
                        bamazon();
                    }
                });
            });
    });
}