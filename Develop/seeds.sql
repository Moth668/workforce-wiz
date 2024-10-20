INSERT INTO department (department_name)
VALUES 
('sales'),
('production'),
('shipping'),
('management');

SELECT * FROM department;

INSERT INTO employee_role (role_title, role_salary, department_id)
VALUES
('manager', 70000, 4),
('technician', 130000, 2);

SELECT * FROM employee_role;

INSERT INTO employee (employee_id, first_name, last_name, role_id, manager_id)
VALUES
(DEFAULT, 'Tim', 'Rice', 1, NULL), -- TR is a manager, so no manager_id
(DEFAULT, 'Bob', 'Ross', 2, NULL); -- BR reports to TR (employee_id 1)

UPDATE employee SET manager_id = 1 WHERE first_name = 'Bob' AND last_name = 'Ross';

SELECT * FROM employee;