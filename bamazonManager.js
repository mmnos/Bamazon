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

  promptManager();

});

let promptManager = () => {

  inquirer.prompt({

    name : "command",
    type : "list",
    message : "What would you like to do?",
    choices : [
      "View Products for Sale",
      "View Low Inventory",
      "Add to Inventory",
      "Add New Product",
      "Exit"
    ]

  }).then(({command}) => {

    switch(command) {

      case "View Products for Sale" :
        viewProducts();
        break;

      case "View Low Inventory" :
        lowInventory();
        break;

      case "Add to Inventory" :
        addInventory();
        break;

      case "Add New Product" :
        newProduct();
        break;

      case "Exit" :
        connection.end();
        break;

    }

  });

}

let viewProducts = () => {

  let query = `SELECT * FROM products`;

  connection.query(query, (err, res) => {

    if (err) throw err;

    res.forEach((r) => {
      console.log("******************************")
      console.log(`
      Item ID : ${r.item_id}
      Name : ${r.product_name}
      Price : $${r.price}
      Quantity : ${r.stock_quantity}
      `);
    });
    promptManager();
  });

}

let lowInventory = () => {

  let query = `SELECT * FROM products WHERE stock_quantity < 5`;

  connection.query(query, (err, res) => {

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
    promptManager();
  })

}

let addInventory = () => {

  inquirer.prompt([

    {
      name : "itemID",
      type : "input",
      message : "Enter the items ID that you'd like to restock",
    },
    {
      name : "amount",
      type : "input",
      message : "How much would you like to add?"
    }

  ]).then(({itemID, amount}) => {

    let query = `SELECT * FROM products WHERE item_id = ${itemID}`;

    connection.query(query, (err, res) => {

      // let addStock = res[0].stock_quantity + amount;

      if (err) throw err;

      query = `UPDATE products SET stock_quantity = stock_quantity + ${amount} WHERE item_id = ${itemID}`;

      connection.query(query, (err, res) => {

        console.log(`
        You've added ${amount} more to item #${itemID}
        `);

        promptManager();
      });

    });
  })

}

let newProduct = () => {

  inquirer.prompt([

    {
      name : "product",
      type : "input",
      message : "Enter the products name :"
    },
    {
      name : "department",
      type : "input",
      message : "Enter the department name :"
    },
    {
      name : "price",
      type : "input",
      message : "Enter the price :"
    },
    {
      name : "quantity",
      type : "input",
      message : "Enter the quantity of the product :"
    }

  ]).then(({product, department, price, quantity}) => {

    let query = `INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('${product}', '${department}', '${price}', '${quantity}')`;

    connection.query(query, (err, res) => {

      console.log(`You've added a ${product} to the database`);

      promptManager();
    });


  });

}