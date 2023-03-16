INSERT INTO department (name)
VALUES  ("Developer"),
        ("Finance"),
        ("Management"),
        ("Sales"),
        ("HR");

INSERT INTO role (title, salary, department_id)
VALUES  ("Developer Manager", 500000, 1),
        ("Developer Lead", 20000, 1),
        ("Staff Engineer", 80000, 1),
        ("Finance Manager", 85000, 2),
        ("Accountant", 70000, 2),
        ("Data Manager", 95000, 3),
        ("Data Sr. Analyst", 82000, 3),
        ("Data Analyst", 70000, 3),
        ("Sales Manager", 75000, 4),
        ("Salesperson", 65000, 4),
        ("HR Manager", 110000, 5),
        ("Lawyer", 95000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ("Max", "Say",  1, NULL),
        ("Kyle", "Smith",  2, 1), lead
        ("Malcom", "Smith",  3, 1), 
        ("Homer", "Smith",  4, NULL), 
        ("Julia", "Smith",  5, 4),
        ("Peppa", "Holmes",  6, NULL), 
        ("Kylie", "Holmes",  7, 6), 
        ("Roger", "Holmes",  8, 6), 
        ("Jin", "Dai",  9, NULL), 
        ("Jooeun", "Dai",  10, 9), 
        ("Jocelyn", "Davalos",  11, NULL), 
        ("Jaylia", "Davalos",  12, 11);