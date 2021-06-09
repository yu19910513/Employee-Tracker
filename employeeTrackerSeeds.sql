DROP DATABASE IF EXISTS employeeTracker_DB;

CREATE DATABASE employeeTracker_DB;
USE employeeTracker_DB;

CREATE TABLE department (
    id INT not null auto_increment,
    PRIMARY KEY (id),
    name VARCHAR(30) not null
);

CREATE TABLE role (
    id INT not null auto_increment,
    PRIMARY KEY (id),
    title VARCHAR(30) not null,
    salary DECIMAL (5,2) not null,
    department_id INT (30),
    manager boolean default false
);


CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (id),
    first_name VARCHAR(30) not NULL,
    last_name VARCHAR(30) not NULL,
    role_id INT (30),
    manager_id INT
);

insert into department (name, id) values ('Technology', 1);
insert into department (name, id) values ('Food', 2);
insert into department (name, id) values ('Healthcare', 3);

insert into employee (first_name, last_name, id, role_id) values ('rex', 'yu', 1234, 4);
insert into employee (first_name, last_name, id, role_id, manager_id) values ('duong', 'nguyen', 4567, 1, 4567);
insert into employee (first_name, last_name, id, role_id) values ('John', 'Smith', 3456, 2);
insert into employee (first_name, last_name, id, role_id) values ('Amy', 'Shoemakers', 7890, 2);
insert into employee (first_name, last_name, id, role_id) values ('Ross', 'Ty', 2345, 3);
insert into employee (first_name, last_name, id, role_id) values ('Kyle', 'Kings', 5678, 3);
insert into employee (first_name, last_name, id, role_id) values ('Somone', 'Important', 9078, 2);

insert into role (title, salary, department_id, manager, id) values ('intern', 300.00, 1,  false, 4);
insert into role (title, salary, department_id, manager, id) values ('manager', 500.0, 1, true, 1);
insert into role (title, salary, department_id, manager, id) values ('engineer', 400.0, 1, false, 2);
insert into role (title, salary, department_id, manager, id) values ('support', 350.0, 1, false, 3);
