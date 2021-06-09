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
            'add department',
            'add role',
        ]
    }).then((ans) => {
        switch (ans.mainPage) {
            case "view employees":
                view_all_employees();
            break;

            case "edit/remove/add employee":
                edit_remove_add_employee();
            break;

            case "add department":
                add_department();
            break;

            case "add role":
                add_role();
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

const add_department = () => {
    inquirer.prompt({
        type: 'input',
        message: 'name of the new dept',
        name: 'dept'
    }).then((ans)=>{
        connection.query("INSERT INTO department SET ?",
      {
          name: ans.dept
      });
      console.log(`A new department was added: ${ans.dept}`);
      dept_or_home()
    })
};

const dept_or_home = () => {
    inquirer.prompt({
        type: "list",
        message: "choose one of the following options",
        name: "go",
        choices: ['go back', 'add more departments?']
    })
    .then((ans) => {
        if (ans.go == 'go back') {
            triggerQ();
        } else {add_department()}
    })
};

const add_role = () => {
    inquirer.prompt([{
        type: 'input',
        message: 'title of the new role',
        name: 'role'
    },
{
    type: 'input',
    message: 'salary of this new role ($---.--)',
    name: 'salary'
},
{
    type: 'list',
    message: 'belong to which department',
    name: 'dept',
    choices: getDept()
}]).then((ans)=>{
    connection.query(`SELECT id from department where name = '${ans.dept}'`, function(err, res) {
        if (err) throw err
        connection.query("INSERT INTO role SET ?",
        {
            title: ans.role,
            salary: ans.salary,
            department_id: res[0].id
        });
        console.log(`A new role was added: ${ans.role}`);
        role_or_home()
      })
    });
};

const role_or_home = () => {
    inquirer.prompt({
        type: "list",
        message: "choose one of the following options",
        name: "go",
        choices: ['go back', 'add more roles?']
    })
    .then((ans) => {
        if (ans.go == 'go back') {
            triggerQ();
        } else {add_role()}
    })
};

var updatedDept = [];
const getDept = () => {
      connection.query("SELECT name FROM department", function(err, res) {
            if (err) throw err
                for (var i = 0; i < res.length; i++) {
                    updatedDept.push(res[i].name);
                }
        })
      return updatedDept
};
