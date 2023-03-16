// Importing packages
const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
// Encryption for env file
require("dotenv").config();
// variables for env
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
// Connect to database
async function dbConnection() {
    try {
        const db = await mysql.createConnection (
            {
                host: 'localhost',
                user: dbUser,
                password: dbPassword,
                database: dbName,
            }
        );
    //Variables for query returns and prompt responses
    let returnedRowsFromDb = [];
    let returnedOutputFromInq = [];
    // switch for all user input cases
    switch (select) {
    //View all departments output
    case "View All Departments":
        returnedRowsFromDb = await db.query("SELECT * FROM department");
        console.table(returnedRowsFromDb[0]);
        break;
    // View all roles output
    case "View All Roles":
        returnedRowsFromDb = await db.query(`
                SELECT
                    role.id,
                    role.title,
                    role.salary,
                    department.name AS department
                FROM role
                JOIN department ON role.department_id = department.id
                `);
        console.table(returnedRowsFromDb[0]); 
        break;
      // Vew all employees output
    case "View All Employees":
        returnedRowsFromDb = await db.query(`
                SELECT
                    employee.id,
                    employee.first_name,
                    employee.last_name,
                    role.title AS title,
                    department.name AS department,
                    role.salary AS salary,
                    CASE WHEN employee.manager_id IS NOT NULL THEN CONCAT(manager_table.first_name,' ', manager_table.last_name) ELSE NULL END AS manager
                FROM employee
                JOIN role ON employee.role_id = role.id
                JOIN department ON role.department_id = department.id
                JOIN employee manager_table ON employee.manager_id = manager_table.id
                `);
        console.table(returnedRowsFromDb[0]); 
        break;
    }
    //Add a department to database
    case "Add a Department":
        returnedOutputFromInq = await inquirer.prompt([
        {
            name: "department",
            message: "Enter New Department Name:",
        },
    ]);
    try {
      // SQL query to add department
        returnedRowsFromDb = await db.query(
            `INSERT INTO department (name) VALUES ('${returnedOutputFromInq.department}');`);
        } catch (error) {
            console.log("Cannot insert duplicate Department");
    }

    break;

  //Add a role to database, prompts user using inquirer
    case "Add a Role":
        returnedOutputFromInq = await inquirer.prompt([
        {
            name: "roleName",
            message: "Enter New Role Name:",
        },
        {
            name: "roleSalary",
            message: "Enter New Role Salary:",
        },
        {
            name: "roleDpt",
            message: "Enter New Role Department:",
        },
    ]);

    // Destructure returnedOutputFromInq
    const { roleName, roleSalary, roleDpt } = returnedOutputFromInq;

    // Make a variable to store value from the DB call to get department id
    const returnDepartmentId = await db.query(
        `SELECT IFNULL((SELECT id FROM department WHERE name = "${roleDpt}"), "Department Does Not Exist")`
    );

    // Write a query to get the department id from the name
    const [rows] = returnDepartmentId;
    const department_id = Object.values(rows[0])[0];

    // Check to see if the id exist in the DB or not and return a "Department Doesn't Exist!" or something like that
    if (department_id === "Department Does Not Exist") {
        console.log("Enter a Role in an Existing Department!");
        break;
    }
    // SQL query to add new role to database
    returnedRowsFromDb = await db.query(
        ` INSERT INTO role (title, salary, department_id) VALUES ('${roleName}', '${roleSalary}', '${department_id}');`
    );
    break;

  //Add an employee to database
    case "Add an Employee":
        returnedOutputFromInq = await inquirer.prompt([
            {
                name: "first_name",
                message: "Enter New Employee's First Name:",
            },
            {
                name: "last_name",
                message: "Enter New Employee's Last Name:",
            },
            {
                name: "role",
                message: "Enter New Employee's Role:",
            },
            {
                name: "manager",
                message: "Enter New Employee's Manager:",
            },
        ]);

    const allRoles = await db.query("select * from role;");
    const allManagers = await db.query(
        "select * from employee where manager_id is null;"
    );
    const { first_name, last_name, role, manager } = returnedOutputFromInq;
    
    const role_data = allRoles[0].filter((r) => {
        return r.title === role;
    });
    const manager_data = allManagers[0].filter((m) => {
        return `${m.first_name} ${m.last_name}` === manager;
    });
    //SQL query to add employee to database
    returnedRowsFromDb = await db.query(
        `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${first_name}', '${last_name}', ${role_data[0].id}, ${manager_data[0].id})`
    );
    break;

  // Update employee
    case "Update an Employee Role":
        currentEmployees = await db.query(
            `SELECT id, first_name, last_name FROM employee;`);
        currentRoles = await db.query(
            `SELECT id, title FROM role;`);

    const employeeList = currentEmployees[0].map((employee) => {
        return {
            name: `${employee["first_name"]} ${employee.last_name}`,
            value: employee.id,
        };
    });
    const roleList = currentRoles[0].map((role) => {
        return {
        name: role.title,
        value: role.id,
        };
    });

    returnedOutputFromInq = await inquirer.prompt([
        {
            type: "list",
            name: "employeeId",
            message: "Choose Which Employee to Update:",
            choices: employeeList,
        },
        {
            type: "list",
            name: "newRole",
            message: "Please Enter Employee's New Role:",
            choices: roleList,
        },
    ]);
    console.log(returnedOutputFromInq);

    // Update employee 
    returnedRowsFromDb = await db.query(
    `UPDATE employee
    SET role_id = ${returnedOutputFromInq.newRole}
    WHERE employee.id = ${returnedOutputFromInq.employeeId};`);
    break;

    } catch (err) {
        console.log(err)
    }
};
//Funtion to prompt user to choose cases to execute
function userPrompt() {
    inquirer
    .prompt([
        {
            type: "list",
            name: "select",
            message: "What would you like to do?",
            choices: [
                "View All Departments",
                "View All Roles",
                "View All Employees",
                "Add a Department",
                "Add a Role",
                "Add an Employee",
                "Update an Employee Role",
                new inquirer.Separator(),
                "Quit",
            ],
        },
    ])
    .then(async (res) => {
        await dbConnection(res.select);
        res.select === "Quit" ? process.exit() : userPrompt();
    })
    .catch((err) => {
        if (error.isTtyError) {
        } else {
            err;
        }
    });
}

userPrompt();