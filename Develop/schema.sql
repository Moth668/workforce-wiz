
DROP DATABASE IF EXISTS department_db;
CREATE DATABASE department_db;

USE department_db;

SELECT current_database();

-- `department`
CREATE TABLE department (
-- `id`: `SERIAL PRIMARY KEY`
department_id SERIAL PRIMARY KEY,
-- `name`: `VARCHAR(30) UNIQUE NOT NULL` to hold department name
department_name VARCHAR(30) UNIQUE NOT NULL
);

-- * `role`
CREATE TABLE employee_role (
--   * `id`: `SERIAL PRIMARY KEY`
role_id SERIAL PRIMARY KEY,
--   * `title`: `VARCHAR(30) UNIQUE NOT NULL` to hold role title
role_title VARCHAR(30) UNIQUE NOT NULL,
--   * `salary`: `DECIMAL NOT NULL` to hold role salary
role_salary DECIMAL NOT NULL,
--   * `department_id`: `INTEGER NOT NULL` to hold reference to department role belongs to
department_id INTEGER NOT NULL REFERENCES department(department_id)
);

-- * `employee`
CREATE TABLE employee (
--   * `id`: `SERIAL PRIMARY KEY`
employee_id SERIAL PRIMARY KEY,
--   * `first_name`: `VARCHAR(30) NOT NULL` to hold employee first name
first_name VARCHAR(30) NOT NULL,
--   * `last_name`: `VARCHAR(30) NOT NULL` to hold employee last name
last_name VARCHAR(30) NOT NULL,
--   * `role_id`: `INTEGER NOT NULL` to hold reference to employee role
role_id INTEGER NOT NULL REFERENCES employee_role(role_id),
--   * `manager_id`: `INTEGER` to hold reference to another employee that is the manager of the current employee (`null` if the employee has no manager)
manager_id INTEGER REFERENCES employee(employee_id)
);


-- ## Bonus

-- Try to add some additional functionality to your application, such as the ability to do the following:

-- * Update employee managers.

-- * View employees by manager.

-- * View employees by department.

-- * Delete departments, roles, and employees.

-- * View the total utilized budget of a department&mdash;in other words, the combined salaries of all employees in that department.
