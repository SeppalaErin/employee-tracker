const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

// create the connection information for the sql database
const connection = mysql.createConnection({
  host: 'localhost',

  port: 3306,

  user: 'root',

  password: 'yourRootPassword',

  database: 'cms',
});

// View Functions

const viewDepartments = () => {
  connection.query('SELECT * FROM department', (err, results) => {
    if (err) throw err;
    const table = cTable.getTable(results);
    console.log(table);
    start();
  })
};

const viewRoles = () => {
  connection.query('SELECT role.role_id, role.title, role.salary, department.department_id, department.department_name, role.department_id FROM role LEFT JOIN department ON role.department_id = department.department_id',
  (err, results) => {
    if (err) throw err;
    const table = cTable.getTable(results)
    console.log(table);
    start();
  });
};

const viewEmployees = () => {
  connection.query('SELECT employee.employee_id, employee.first_name, employee.last_name, department.department_name, employee.manager_id, employee.role_id, role.salary, role.title, role.role_id, employee.manager_name FROM employee LEFT JOIN role ON employee.role_id = role.role_id LEFT JOIN department ON role.department_id = department.department_id',
    (err, results) => {
      if (err) throw err;
      const table = cTable.getTable(results)
      console.log(table);
      start();
    });
};

// Add Functions

const addDepartment = () => {
  inquirer
    .prompt({
      name: 'newDepartment',
      type: "input",
      message: "What is the name of the department you want to add?"
    })
    .then((answer) => {
      connection.query(
        'INSERT INTO department SET ?', {
          department_name: answer.newDepartment
        },
        (err) => {
          if (err) throw err;
          console.log("Your department has been added.")
          start();
        }
      );
    });
};

const addRole = () => {
  connection.query('SELECT * FROM department', (err, results) => {
    if (err) throw err;
    inquirer
      .prompt([{
          name: 'newRole',
          type: "input",
          message: "What is the name of the role you want to add?"
        },
        {
          name: 'salary',
          type: 'input',
          message: "What is the salary of this role?"
        },
        {
          name: 'choice',
          type: 'rawlist',
          message: "What is the department that this role is a part of?",
          choices() {
            const choicesArray = [];
            results.forEach(({
              department_name
            }) => {
              choicesArray.push(department_name)
            });
            return choicesArray;
          }
        }
      ])
      .then((answer) => {
        let chosenDepartment;
        results.forEach((department) => {
          if (department.department_name === answer.choice) {
            chosenDepartment = department.department_id;
          }
        })
        connection.query(
          'INSERT INTO role SET ?', 
          {
            'title': answer.newRole,
            'salary': answer.salary,
            'department_id': chosenDepartment,
          },
          (err) => {
            if (err) throw err;
            console.log("Your role was created successfully")
            start();
          }
        );
      });
  });
};

const addEmployee = () => {
  connection.query('SELECT employee.employee_id, employee.first_name, employee.last_name, department.department_name, employee.manager_id, employee.role_id, role.salary, role.title, role.role_id FROM employee RIGHT JOIN role ON employee.role_id = role.role_id INNER JOIN department ON role.department_id = department.department_id', 
  (err, results) => {
    if (err) throw err;
    inquirer.prompt([
      {
        name: 'firstName',
        type: 'input',
        message: 'What is the first name of the new employee?'
      },
      {
        name: 'lastName',
        type: 'input',
        message: 'What is the last name of the employee'
      },
      {
        name: 'role',
        type: 'rawlist',
        message: 'What is the role of this employee?',
        choices() {
          const choicesArray = [];
          results.forEach(({
            title
          }) => {
            choicesArray.push(title)
          });
          return choicesArray;
        } 
      },
      {
        name: 'manager',
        type: 'rawlist',
        message: 'Does this employee have a manger?',
        choices: ['yes', 'no']
      }
    ])
    .then((answer) => {
      let chosenRole;
      results.forEach((role) => {
        if (role.title === answer.role) {
          chosenRole = role.role_id;
        }
      })
      connection.query(
        'INSERT INTO employee SET ?',
        {
          'first_name' : answer.firstName,
          'last_name' : answer.lastName,
          'role_id' : chosenRole
        }
      )
      if (answer.manager === 'yes') {
        addManager(answer.firstName);
      } else {
        start();
      }
    })
  }
  )
}

const addManager = (currentEmployee) => {
  connection.query('SELECT * FROM employee', (err, results) => {
    if (err) throw err;
    inquirer.prompt({
      name: 'manager',
      type: 'rawlist',
      message: 'Which of these individuals is the manager of this employee?',
      choices()  {
        const choicesArray = [];
        results.forEach(({
          first_name
        }) => {
          choicesArray.push(first_name)
        })
        return choicesArray;
      }
    })
    .then((answer) => {
      let chosenManager;
      results.forEach((employee) => {
        if (employee.first_name === answer.manager) {
          chosenManager = employee.employee_id
        }
      })
      console.log(chosenManager);
      console.log(currentEmployee);
      connection.query(
        'UPDATE employee SET manager_id = ? WHERE first_name = ?',
        [chosenManager, currentEmployee],
        (error) => {
          if (error) throw err;
        }
      )
      connection.query(
        'UPDATE employee SET manager_name = ? WHERE first_name = ?',
        [answer.manager, currentEmployee],
        (error) => {
          if (error) throw err;
        })
      start();
    }) 
  })

}

// Update Functions

const updateRole = () => {
  connection.query('SELECT role.role_id, employee.first_name, role.title FROM role LEFT JOIN employee ON role.role_id = employee.role_id',
    (err, results) => {
      if (err) throw err;
      inquirer
      .prompt([
        {
          name: 'updatedEmployee',
          type: 'rawlist',
          choices() {
            const choicesArray = [];
            results.forEach(({
              first_name
            }) => {
              if (first_name != null) {
                choicesArray.push(first_name)
              }
            });
            return choicesArray;
          },
          message: "Which employee would you like to update?"
        },
        {
          name: 'newRole',
          type: 'rawlist',
          choices() {
            const choicesArray = [];
            results.forEach(({
              title
            }) => {
              choicesArray.push(title)
            });
            return choicesArray;
          },
          message: "What would you like their new role to be?"
        }
      ])
      .then((answer) => {
        let chosenRoleId;
        results.forEach((role) => {
          if (role.title === answer.newRole) {
            chosenRoleId = role.role_id;
          }
        })
        connection.query(
          'UPDATE employee SET role_id = ? WHERE first_name = ?',
          [chosenRoleId, answer.updatedEmployee],
          (error) => {
            if (error) throw err;
            console.log(`${answer.updatedEmployee}'s role has been updated to ${answer.newRole}`)
          }
        )
        start();
      })
      
    });
};

const updateManager = () => {
  connection.query('SELECT * FROM employee', (err, results) => {
    if (err) throw err;
  inquirer.prompt(
    {
      name: 'updatedEmployee',
      type: 'rawlist',
      message: 'What is the name of the employee you want to update?',
      choices() {
        const choicesArray = [];
        results.forEach(({
          first_name
        }) => {
          choicesArray.push(first_name)
        });
        return choicesArray;
      } 
    })
    .then((answer) => {
      addManager(answer.updatedEmployee);
    })
    
      
  })
};

// Delete Functions

const deleteDepartment = () => {
  connection.query('SELECT * FROM department', (err, results) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: 'choice',
          type: 'rawlist',
          choices() {
            const choicesArray = [];
            results.forEach(({
              department_name
            }) => {
              choicesArray.push(department_name)
            });
            return choicesArray;
          },
          message: "Which department do you want to delete?"
        }
      ])
      .then((answer) => {
        let chosenDepartment;
        results.forEach((department) => {
          if (department.department_name === answer.choice) {
            chosenDepartment = department.department_name;
          };
        });
        
        connection.query(
          'DELETE FROM department WHERE ?', 
          {
            department_name: chosenDepartment
          },
          (err) => {
            if (err) throw err;
            console.log("Your department was deleted successfully")
            start();
          }
        );
      });
  });
};

const deleteRole = () => {
  connection.query('SELECT * FROM role', (err, results) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: 'choice',
          type: 'rawlist',
          choices() {
            const choicesArray = [];
            results.forEach(({
              title
            }) => {
              choicesArray.push(title)
            });
            return choicesArray;
          },
          message: "Which role do you want to delete?"
        }
      ])
      .then((answer) => {
        let chosenRole;
        results.forEach((role) => {
          if (role.title === answer.choice) {
            chosenRole = role.title;
          };
        })
        
        connection.query(
          'DELETE FROM role WHERE ?', 
          {
            title: chosenRole
          },
          (err) => {
            if (err) throw err;
            console.log("Your role was deleted successfully")
            start();
          }
        );
      });
  });
};

const deleteEmployee = () => {
  connection.query('SELECT * FROM employee', (err, results) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: 'choice',
          type: 'rawlist',
          choices() {
            const choicesArray = [];
            results.forEach(({
              last_name
            }) => {
              choicesArray.push(last_name)
            });
            return choicesArray;
          },
          message: "Which employee do you want to delete?"
        }
      ])
      .then((answer) => {
        let chosenEmployee;
        results.forEach((employee) => {
          if (employee.last_name === answer.choice) {
            chosenEmployee = employee.last_name;
          };
        });
        
        connection.query(
          'DELETE FROM employee WHERE ?', 
          {
            last_name: chosenEmployee
          },
          (err) => {
            if (err) throw err;
            console.log(`${chosenEmployee} was deleted successfully`)
            start();
          }
        );
      });
  });
};

// 

const findTotalBudget = () => {
  console.log("Work In Progress");
  
}

// Function to exit out of the application

const quit = () => {
  console.log("Thank you for using this program! Goodbye.");
  connection.end();
}

// On start begin application

const start = () => {
  inquirer
    .prompt({
      name: "firstChoice",
      type: 'rawlist',
      message: "What would you like to do?",
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        "Update an employee's role",
        "Update an employee's manager",
        'Delete a department',
        'Delete a role',
        'Delete an employee',
        // 'View a total utilized budget of a department',
        'I am done for now'
      ]
    })
    .then((answer) => {
      if (answer.firstChoice === 'Add a department') {
        addDepartment();
      } else if (answer.firstChoice === 'View all departments') {
        viewDepartments();
      } else if (answer.firstChoice === 'View all roles') {
        viewRoles();
      } else if (answer.firstChoice === 'View all employees') {
        viewEmployees();
      } else if (answer.firstChoice === 'Add a role') {
        addRole();
      } else if (answer.firstChoice === 'Add an employee') {
        addEmployee();
      } else if (answer.firstChoice === "Update an employee's role") {
        updateRole();
      } else if (answer.firstChoice === "Update an employee's manager") {
        updateManager();
      } else if (answer.firstChoice === "Delete a department") {
        deleteDepartment();
      } else if (answer.firstChoice === "Delete a role") {
        deleteRole();
      } else if (answer.firstChoice === "Delete an employee") {
        deleteEmployee();
      } else if (answer.firstChoice === "View a total utilized budget of a department") {
        findTotalBudget();
      } else {
        quit();
      }
    });
};

// connect to the mysql server and sql database
connection.connect((err) => {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  start();
});