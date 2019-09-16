require("dotenv").config();

const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({

  host : process.env.DB_Host,

  port : 3306,

  user : process.env.DB_User,

  password : process.env.DB_Pass,
  database : "bamazon"

});

connection.connect((err) => {

  if (err) throw err;

  console.log("connected");

  promptCustomer();

});

let promptCustomer = () => {

  let displayProd = `SELECT * FROM products`
  
  connection.query(displayProd, (err, res) => {

    if (err) throw err;

    res.forEach((r) => {
      console.log("******************************")
      console.log(`
      Item ID : ${r.item_id}
      Name : ${r.product_name}
      Department : ${r.department_name}
      Price : $${r.price}
      Quantity : ${r.stock_quantity}
      `);
    });

    inquirer.prompt([
      {
        name : "id",
        type : "input",
        message : "Enter the items ID you'd like to purchase"
      },
      {
        name : "quantity",
        type : "input",
        message : "How many would you like to purchase?"
      }
    ]).then(({id, quantity}) => {

      let query = `SELECT * FROM products WHERE item_id = ${id}`;

      connection.query(query, (err, res) => {

        let total = res[0].price * quantity;
        let sQuantity = res[0].stock_quantity - quantity;

        if (err) throw err;

        if (quantity > res[0].stock_quantity) {

          console.log("INSUFFICIENT QUANTITY");
          
        } else {

          query = `UPDATE products SET stock_quantity = stock_quantity - ${quantity} WHERE item_id = ${id}`;

          connection.query(query, (err, res) => {

            console.log(`
            ORDER COMPLETE!
            Your total is : $${total}
            There are ${sQuantity} left in stock!
            `);

          });

        }

        connection.end();

      });
      
    });

  });

}