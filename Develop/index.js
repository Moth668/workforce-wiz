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
        'Update a manager',
        'View employees by manager',
        'View employees by department',
        'Delete a department',
        'Delete a role',
        'Delete employee',
        'Calculate total salary',
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
        case 'Update a manager':
          updateEmployeeManager();
          break;
        case 'View employees by manager':
          viewEmployeesByManager();
          break;
        case 'View employees by department':
          viewEmployeesByDepartment();
          break;
        case 'Delete a department':
          deleteDepartment();
          break;
        case 'Delete a role':
          deleteRole();
          break;
        case 'Delete employee':
          deleteEmployee();
          break;
        case 'Calculate total salary':
          viewTotalBudgetByDepartment();
          break;
        default:
          pool.end(err => {
            if (err) {
              console.error('Error closing the database connection:', err);
            } else {
              console.log('Database connection closed.');
              mainMenu();
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

// Function to update an employee's manager
async function updateEmployeeManager() {
  const employees = await pool.query('SELECT * FROM employee');
  const employeeChoices = employees.rows.map(emp => ({
      name: `${emp.first_name} ${emp.last_name}`,
      value: emp.employee_id
  }));

  const managers = await pool.query('SELECT * FROM employee');
  const managerChoices = managers.rows.map(manager => ({
      name: `${manager.first_name} ${manager.last_name}`,
      value: manager.employee_id
  }));

  const { employee_id, manager_id } = await inquirer.prompt([
      {
          type: 'list',
          name: 'employee_id',
          message: 'Select the employee to update:',
          choices: employeeChoices
      },
      {
          type: 'list',
          name: 'manager_id',
          message: 'Select the new manager for this employee (if applicable):',
          choices: [...managerChoices, { name: 'None', value: null }]
      }
  ]);

  await pool.query('UPDATE employee SET manager_id = $1 WHERE employee_id = $2', [manager_id, employee_id]);
  console.log(`Employee's manager updated successfully.`);
  mainMenu();
};

// Function to view employees that report to a specific manager
async function viewEmployeesByManager() {
  const managers = await pool.query('SELECT * FROM employee');
  const managerChoices = managers.rows.map(manager => ({
      name: `${manager.first_name} ${manager.last_name}`,
      value: manager.employee_id
  }));

  const { manager_id } = await inquirer.prompt([
      {
          type: 'list',
          name: 'manager_id',
          message: 'Select a manager to view their employees:',
          choices: managerChoices
      }
  ]);

  const res = await pool.query('SELECT * FROM employee WHERE manager_id = $1', [manager_id]);
  console.table(res.rows);
  mainMenu();
}

// Function to view employees that belong to a department
async function viewEmployeesByDepartment() {
  const departments = await pool.query('SELECT * FROM department');
  const departmentChoices = departments.rows.map(dept => ({
      name: dept.department_name,
      value: dept.department_id
  }));

  const { department_id } = await inquirer.prompt([
      {
          type: 'list',
          name: 'department_id',
          message: 'Select a department to view its employees:',
          choices: departmentChoices
      }
  ]);

  const res = await pool.query(`
      SELECT e.*, r.role_title
      FROM employee e
      JOIN employee_role r ON e.role_id = r.role_id
      WHERE r.department_id = $1
  `, [department_id]);
  
  console.table(res.rows);
  mainMenu();
}

// Function to delete an entire department
async function deleteDepartment() {
  const departments = await pool.query('SELECT * FROM department');
  const departmentChoices = departments.rows.map(dept => ({
      name: dept.department_name,
      value: dept.department_id
  }));

  const { department_id } = await inquirer.prompt([
      {
          type: 'list',
          name: 'department_id',
          message: 'Select a department to delete:',
          choices: departmentChoices
      }
  ]);

  await pool.query('DELETE FROM department WHERE department_id = $1', [department_id]);
  console.log(`Department deleted successfully.`);
  mainMenu();
}

// Function to delete an entire role
async function deleteRole() {
  const roles = await pool.query('SELECT * FROM employee_role');
  const roleChoices = roles.rows.map(role => ({
      name: role.role_title,
      value: role.role_id
  }));

  const { role_id } = await inquirer.prompt([
      {
          type: 'list',
          name: 'role_id',
          message: 'Select a role to delete:',
          choices: roleChoices
      }
  ]);

  await pool.query('DELETE FROM employee_role WHERE role_id = $1', [role_id]);
  console.log(`Role deleted successfully.`);
  mainMenu();
}

// Function to delete an employee
async function deleteEmployee() {
  const employees = await pool.query('SELECT * FROM employee');
  const employeeChoices = employees.rows.map(emp => ({
      name: `${emp.first_name} ${emp.last_name}`,
      value: emp.employee_id
  }));

  const { employee_id } = await inquirer.prompt([
      {
          type: 'list',
          name: 'employee_id',
          message: 'Select an employee to delete:',
          choices: employeeChoices
      }
  ]);

  await pool.query('DELETE FROM employee WHERE employee_id = $1', [employee_id]);
  console.log(`Employee deleted successfully.`);
  mainMenu();
}

// Function to view calculate total salary of employees in a department
async function viewTotalBudgetByDepartment() {
  const departments = await pool.query('SELECT * FROM department');
  const departmentChoices = departments.rows.map(dept => ({
      name: dept.department_name,
      value: dept.department_id
  }));

  const { department_id } = await inquirer.prompt([
      {
          type: 'list',
          name: 'department_id',
          message: 'Select a department to view the total budget:',
          choices: departmentChoices
      }
  ]);

  const res = await pool.query(`
      SELECT SUM(r.role_salary) AS total_budget
      FROM employee e
      JOIN employee_role r ON e.role_id = r.role_id
      WHERE r.department_id = $1
  `, [department_id]);

  console.log(`Total utilized budget for the selected department: $${res.rows[0].total_budget || 0}`);
  mainMenu();
}


// Start the application
mainMenu();
