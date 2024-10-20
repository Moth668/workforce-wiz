import inquirer from 'inquirer';
import { pool } from './db.js'; 

const mainMenu = () => {
  inquirer
    .prompt({
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit'
      ]
    })
    .then(answer => {
      switch (answer.action) {
        case 'View all departments':
          viewAllDepartments();
          break;
        case 'View all roles':
          viewAllRoles();
          break;
        case 'View all employees':
          viewAllEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        default:
          pool.end(err => {
            if (err) {
              console.error('Error closing the database connection:', err);
            } else {
              console.log('Database connection closed.');
            }
            process.exit();
          });
      }
    });
};

// Function to view all departments
const viewAllDepartments = async () => {
  try {
    const res = await pool.query('SELECT * FROM department');
    console.table(res.rows);
    mainMenu();
  } catch (err) {
    console.error(err);
    mainMenu();
  }
};

// Function to view all roles
const viewAllRoles = async () => {
  try {
    const res = await pool.query(`
      SELECT r.role_id, r.role_title, r.role_salary, d.department_name 
      FROM employee_role r 
      JOIN department d ON r.department_id = d.department_id
    `);
    console.table(res.rows);
    mainMenu();
  } catch (err) {
    console.error(err);
  }
};

// Function to view all employees
const viewAllEmployees = async () => {
  try {
    const res = await pool.query(`
      SELECT e.employee_id, e.first_name, e.last_name, r.role_title, d.department_name, r.role_salary, 
      (SELECT CONCAT(m.first_name, ' ', m.last_name) FROM employee m WHERE m.employee_id = e.manager_id) AS manager
      FROM employee e
      JOIN employee_role r ON e.role_id = r.role_id
      JOIN department d ON r.department_id = d.department_id
    `);
    console.table(res.rows);
    mainMenu();
  } catch (err) {
    console.error(err);
  }
};

// Function to add a department
const addDepartment = () => {
  inquirer
    .prompt({
      type: 'input',
      name: 'department_name',
      message: 'Enter the name of the department:'
    })
    .then(async answer => {
      try {
        await pool.query('INSERT INTO department (department_name) VALUES ($1)', [answer.department_name]);
        console.log('Department added!');
        mainMenu();
      } catch (err) {
        console.error(err);
      }
    });
};

// Function to add a role
const addRole = () => {
  inquirer
    .prompt([
      { type: 'input', name: 'role_title', message: 'Enter the role title:' },
      { type: 'input', name: 'role_salary', message: 'Enter the salary for this role:' },
      { type: 'input', name: 'department_id', message: 'Enter the department ID for this role:' }
    ])
    .then(async answer => {
      try {
        await pool.query('INSERT INTO employee_role (role_title, role_salary, department_id) VALUES ($1, $2, $3)', [answer.role_title, answer.role_salary, answer.department_id]);
        console.log('Role added!');
        mainMenu();
      } catch (err) {
        console.error(err);
      }
    });
};

// Function to add an employee
const addEmployee = () => {
  inquirer
    .prompt([
      { type: 'input', name: 'first_name', message: 'Enter the first name:' },
      { type: 'input', name: 'last_name', message: 'Enter the last name:' },
      { type: 'input', name: 'role_id', message: 'Enter the role ID:' },
      { type: 'input', name: 'manager_id', message: 'Enter the manager ID (if applicable):' }
    ])
    .then(async answer => {
      try {
        await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [answer.first_name, answer.last_name, answer.role_id, answer.manager_id || null]);
        console.log('Employee added!');
        mainMenu();
      } catch (err) {
        console.error(err);
      }
    });
};

// Function to update an employee's role
const updateEmployeeRole = () => {
  inquirer
    .prompt([
      { type: 'input', name: 'employee_id', message: 'Enter the employee ID:' },
      { type: 'input', name: 'role_id', message: 'Enter the new role ID:' }
    ])
    .then(async answer => {
      try {
        await pool.query('UPDATE employee SET role_id = $1 WHERE employee_id = $2', [answer.role_id, answer.employee_id]);
        console.log('Employee role updated!');
        mainMenu();
      } catch (err) {
        console.error(err);
      }
    });
};

// Start the application
mainMenu();
