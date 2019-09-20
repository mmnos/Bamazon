require("dotenv").config();

const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

const connection = mysql.createConnection({

  host : process.env.DB_Host,

  port : 3306,

  user : process.env.DB_User,

  password : process.env.DB_Pass,
  database : "bamazon"

});

connection.connect((err) => {

  if (err) throw err;

  promptSupervisor();

});

let promptSupervisor = () => {

  inquirer.prompt({

    name : "command",
    type : "list",
    message : "What would you like to do?",
    choices : [
      "View Product Sales by Department",
      "Create New Department",
      "Exit"
    ]

  }).then(({command}) => {

    switch(command) {

      case "View Product Sales by Department" :
        viewSales();
        break;

      case "Create New Department" :
        createDep();
        break;

      case "Exit" :
        connection.end();
        break;

    }

  });

}

let viewSales = () => {

  let query = `SELECT departments.department_id, departments.department_name, departments.over_head_costs, SUM(products.product_sales) AS product_sales, `;
  query += `SUM(products.product_sales) - departments.over_head_costs AS total_profit `;
  query += `FROM departments INNER JOIN products ON departments.department_name = products.department_name `;
  query += `GROUP BY department_id, department_name ORDER BY department_id ASC `;

  connection.query(query, (err, res) => {

    if (err) throw err;

    console.table(res);

    promptSupervisor();
    
  });

}

let createDep = () => {

  inquirer.prompt([

    {
      name : "department",
      type : "input",
      message : "Enter the department name you'd like to create :"
    },
    {
      name : "costs",
      type : "input",
      message : "Enter the over head costs :"
    }

  ]).then(({department, costs}) => {

    let query = `INSERT INTO departments (department_name, over_head_costs) VALUES ('${department}', '${costs}')`;

    connection.query(query, (err, res) => {

      console.log(`You've added ${department} as a new department!`);

      promptSupervisor();
      
    });


  });

}