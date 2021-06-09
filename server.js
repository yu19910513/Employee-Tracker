const inquirer = require("inquirer")
const mysql = require("mysql")
const cTable = require('console.table');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employeeTracker_DB"
  });


connection.connect( (err) => {
    if (err) throw err
    console.log("Connecting @ " + connection.threadId)
    triggerQ();
});

const triggerQ = () => {
    inquirer.prompt({
        type: "rawlist",
        message: "Choose one of the following tasks:",
        name: "mainPage",
        choices: [
            'view employees',
            'edit/remove/add employee',
            'edit/remove/add department',
            'edit/remove/add role',
        ]
    }).then((ans) => {
        switch (ans.mainPage) {
            case "view employees":
                view_all_employees();
            break;

            case "edit/remove/add employee":
                edit_remove_add_employee();
            break;

            case "edit/remove/add department":
                edit_remove_add_department();
            break;

            case "view employees":
                edit_remove_add_role();
            break;
        }
    })
};

const view_all_employees = () => {
    connection.query(
        `SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, role.manager, manager_id FROM employee
        INNER JOIN role on role.id = employee.role_id
        INNER JOIN department on department.id = role.department_id`,
    function(err, res) {
      if (err) throw err
      console.table(res)
      triggerQ()
  })
};

const edit_remove_add_employee = () => {
    inquirer.prompt({
        type: "rawlist",
        message: "Choose one of the following tasks:",
        name: "choice",
        choices: [
            'update employee',
            'remove employee',
            'add employee',
            'back to the homepage',
        ]
    }).then((ans) => {
        switch (ans.choice) {
            case "update employee":
                update_employee();
            break;

            case "remove employee":
                remove_employee();
            break;

            case "add employee":
                add_employee();
            break;

            case "back to the homepage":
                triggerQ();
            break;
        }
    })
};

const remove_employee = () => {
    connection.query(
        `SELECT employee.last_name, role.title FROM employee
        INNER JOIN role on role.id = employee.role_id
        INNER JOIN department on department.id = role.department_id`,
    function(err, res) {
      if (err) throw err
      console.table(res);
      remove(res)
    })
};
const remove = (res) => {
    inquirer.prompt([
        {
            type: "rawlist",
            message: "Select the employee to remove from the company",
            name: "choice",
            choices() {
                let choiceArray = [];
                res.forEach((res) => {
                    choiceArray.push(res.last_name);
                })
                return choiceArray
            }

        },
        {
        type: "list",
        message: "are you sure?",
        name: "confrim",
        choices: ['yes', 'no']
        }
    ])
    .then ((ans) => {
        if (ans.confrim == 'yes') {
            connection.query(`SELECT id FROM employee WHERE last_name = "${ans.choice}"`,
            function(err, res) {
                if (err) throw err
                connection.query(`DELETE FROM employee WHERE id = ${res[0].id}`)
            });
            console.log(`${ans.choice} is fired!`);
            delete_or_home()
        } else {delete_or_home()}
    })

};

const delete_or_home = () => {
    inquirer.prompt({
        type: "list",
        message: "choose one of the following options",
        name: "go",
        choices: ['go back', 'stay in this queue']
    })
    .then((ans) => {
        if (ans.go == 'go back') {
            triggerQ();
        } else {remove_employee()}
    })
};

const add_employee = () => {
    inquirer.prompt([
        {
            type: 'input',
            message: 'first name',
            name: 'first_name'
        },
        {
            type: 'input',
            message: 'last name',
            name: 'last_name'
        },
        {
            type: 'list',
            message: `role`,
            name: "role",
            choices: getrole()
        },

    ]).then((ans)=>{
        var id = getrole().indexOf(ans.role) + 1;
        connection.query("INSERT INTO employee SET ?",
      {
          first_name: ans.first_name,
          last_name: ans.last_name,
          role_id: id
      });
      managerUpdate(ans);
      add_or_home();
    })
};


const managerUpdate = (ans) => {
    if (ans.role == 'manager') {
        connection.query(`SELECT id from employee WHERE employee.last_name = '${ans.last_name}'`, function(err, res) {
            if (err) throw err
            connection.query(`update employee set manager_id = ${res[0].id} WHERE id = ${res[0].id}`, function(err, res) {
                if (err) throw err
            })
        })
      } console.log(`new ${ans.role} was added!`);
}



const add_or_home = () => {
    inquirer.prompt({
        type: "list",
        message: "choose one of the following options",
        name: "go",
        choices: ['go back', 'add more people?']
    })
    .then((ans) => {
        if (ans.go == 'go back') {
            triggerQ();
        } else {add_employee()}
    })
};

var updatedRole = [];
const getrole = () => {
      connection.query("SELECT title FROM role", function(err, res) {
            if (err) throw err
                for (var i = 0; i < res.length; i++) {
                    updatedRole.push(res[i].title);
                }
        })
      return updatedRole
};

const update_employee = () => {
    connection.query(
        `SELECT employee.last_name, role.title FROM employee
        INNER JOIN role on role.id = employee.role_id
        INNER JOIN department on department.id = role.department_id`,
    function(err, val) {
      if (err) throw err
      update(val)
    })
};

const update = (val) => {
    inquirer.prompt([
        {
            type: "rawlist",
            message: "name",
            name: "last_name",
            choices() {
                let choiceArray = [];
                val.forEach((val) => {
                    choiceArray.push(val.last_name);
                })
                return choiceArray
            }

        },
        {
            type: 'list',
            message: 'change role?',
            name: "role",
            choices: getrole()
        },
    ]).then((ans)=> {
    let newid = getrole().indexOf(ans.role) + 1;
    connection.query(`UPDATE employee SET role_id = '${newid}' where last_name = '${ans.last_name}'`);
     managerUpdate(ans);
     update_or_home()

})
}

const update_or_home = () => {
    inquirer.prompt({
        type: "list",
        message: "choose one of the following options",
        name: "go",
        choices: ['go back', 'update more people?']
    })
    .then((ans) => {
        if (ans.go == 'go back') {
            triggerQ();
        } else {update_employee()}
    })
};

        // connection.query(`SELECT employee.last_name FROM employee`),
    // function (err, res) {
    //   if (err) throw err
    //   console.table(res);
    //   connection.end();
        // inquirer.prompt({
        //     name: 'choice',
        //     type: 'rawlist',
        //     choices()
        //     {
        //         let choiceArray = [];
        //         res.forEach(() => {
        //             choiceArray.push(employee.last_name);
        //         })
        //         return choiceArray
        //     }

        // })
        // .then((ans) => console.log(ans))
    // }


// //============= View All Employees ==========================//
// function viewAllEmployees() {
//     connection.query("SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;",
//     function(err, res) {
//       if (err) throw err
//       console.table(res)
//       startPrompt()
//   })
// }
// //============= View All Roles ==========================//
// function viewAllRoles() {
//   connection.query("SELECT employee.first_name, employee.last_name, role.title AS Title FROM employee JOIN role ON employee.role_id = role.id;",
//   function(err, res) {
//   if (err) throw err
//   console.table(res)
//   startPrompt()
//   })
// }
// //============= View All Employees By Departments ==========================//
// function viewAllDepartments() {
//   connection.query("SELECT employee.first_name, employee.last_name, department.name AS Department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id;",
//   function(err, res) {
//     if (err) throw err
//     console.table(res)
//     startPrompt()
//   })
// }

// //================= Select Role Quieries Role Title for Add Employee Prompt ===========//
// var roleArr = [];
// function selectRole() {
//   connection.query("SELECT * FROM role", function(err, res) {
//     if (err) throw err
//     for (var i = 0; i < res.length; i++) {
//       roleArr.push(res[i].title);
//     }

//   })
//   return roleArr;
// }
// //================= Select Role Quieries The Managers for Add Employee Prompt ===========//
// var managersArr = [];
// function selectManager() {
//   connection.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL", function(err, res) {
//     if (err) throw err
//     for (var i = 0; i < res.length; i++) {
//       managersArr.push(res[i].first_name);
//     }

//   })
//   return managersArr;
// }
// //============= Add Employee ==========================//
// function addEmployee() {
//     inquirer.prompt([
//         {
//           name: "firstname",
//           type: "input",
//           message: "Enter their first name "
//         },
//         {
//           name: "lastname",
//           type: "input",
//           message: "Enter their last name "
//         },
//         {
//           name: "role",
//           type: "list",
//           message: "What is their role? ",
//           choices: selectRole()
//         },
//         {
//             name: "choice",
//             type: "rawlist",
//             message: "Whats their managers name?",
//             choices: selectManager()
//         }
//     ]).then(function (val) {
//       var roleId = selectRole().indexOf(val.role) + 1
//       var managerId = selectManager().indexOf(val.choice) + 1
//       connection.query("INSERT INTO employee SET ?",
//       {
//           first_name: val.firstName,
//           last_name: val.lastName,
//           manager_id: managerId,
//           role_id: roleId

//       }, function(err){
//           if (err) throw err
//           console.table(val)
//           startPrompt()
//       })

//   })
// }
// //============= Update Employee ==========================//
//   function updateEmployee() {
//     connection.query("SELECT employee.last_name, role.title FROM employee JOIN role ON employee.role_id = role.id;", function(err, res) {
//     // console.log(res)
//      if (err) throw err
//      console.log(res)
//     inquirer.prompt([
//           {
//             name: "lastName",
//             type: "rawlist",
//             choices: function() {
//               var lastName = [];
//               for (var i = 0; i < res.length; i++) {
//                 lastName.push(res[i].last_name);
//               }
//               return lastName;
//             },
//             message: "What is the Employee's last name? ",
//           },
//           {
//             name: "role",
//             type: "rawlist",
//             message: "What is the Employees new title? ",
//             choices: selectRole()
//           },
//       ]).then(function(val) {
//         var roleId = selectRole().indexOf(val.role) + 1
//         connection.query("UPDATE employee SET WHERE ?",
//         {
//           last_name: val.lastName

//         },
//         {
//           role_id: roleId

//         },
//         function(err){
//             if (err) throw err
//             console.table(val)
//             startPrompt()
//         })

//     });
//   });

//   }
// //============= Add Employee Role ==========================//
// function addRole() {
//   connection.query("SELECT role.title AS Title, role.salary AS Salary FROM role",   function(err, res) {
//     inquirer.prompt([
//         {
//           name: "Title",
//           type: "input",
//           message: "What is the roles Title?"
//         },
//         {
//           name: "Salary",
//           type: "input",
//           message: "What is the Salary?"

//         }
//     ]).then(function(res) {
//         connection.query(
//             "INSERT INTO role SET ?",
//             {
//               title: res.Title,
//               salary: res.Salary,
//             },
//             function(err) {
//                 if (err) throw err
//                 console.table(res);
//                 startPrompt();
//             }
//         )

//     });
//   });
//   }
// //============= Add Department ==========================//
// function addDepartment() {

//     inquirer.prompt([
//         {
//           name: "name",
//           type: "input",
//           message: "What Department would you like to add?"
//         }
//     ]).then(function(res) {
//         var query = connection.query(
//             "INSERT INTO department SET ? ",
//             {
//               name: res.name

//             },
//             function(err) {
//                 if (err) throw err
//                 console.table(res);
//                 startPrompt();
//             }
//         )
//     })
//   }
