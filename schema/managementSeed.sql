USE cms;

INSERT INTO department(department_name)
VALUES ('HR'), ('Management'), ('Carriers'), ('Clerks');

INSERT INTO role(title, salary, department_id)
VALUES ('CCA', 50000, 3), ('RCA', 56000, 3), ('Clerk', 48000, 4), ('Supevisor', 65000, 2), ('Labor Relations', 60000, 1);

INSERT INTO employee(first_name, last_name, role_id, manager_id, manager_name)
VALUES ('Leroy', 'Jenkins', 3, 5, 'Anakin'), ('Chuck', 'Testa', 1, null, null), ('George', 'Washington', 5, 4, 'Wayne'), ('Wayne', 'Bradey', 2, null, null), ('Anakin', 'Skywalker', 4, 2, 'Chuck');
