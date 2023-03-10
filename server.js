var inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'work_db'
    },
    console.log(`Connected to the movies_db database.`)
  )


var DepartmentLists = [];
var RoleList = [];
var EmployeeList = [];

var ViewDepartments = [];
var ViewRoles = [];
var ViewEmployees = [];

function generateQuestionChoices() {
db.query(
  `SELECT * FROM department`,
  function(err, results, fields) {
    let placeholder = results;
      for (let i = 0; i < placeholder.length; i++) {
        let dep = placeholder[i].department;
        ViewDepartments.push(dep);
      }
    })

db.query(
  `SELECT * FROM role`,
  function(err, results, fields) {
    let placeholder = results;
      for (let i = 0; i < placeholder.length; i++) {
        let dep = placeholder[i].title;
        ViewRoles.push(dep);
      }
  })

  db.query(
    `SELECT * FROM employee`,
    function(err, results, fields) {
      let placeholder = results;
        for (let i = 0; i < placeholder.length; i++) {
          let dep = placeholder[i].first_name + " " + placeholder[i].last_name;
          ViewEmployees.push(dep);
        }
    })
}
generateQuestionChoices()

const questions = [
    {type: "list", 
        name: "first",
        message: "What Would You Like To Do?",
        choices: [
            "View All Employees",
            "Add Employee",
            "Update Employee Role",
            "View All Roles",
            "Add Roles",
            "View All Departments",
            "Add Department",
            "Quit",
        ],
        default: null}];

var addEmployeeQuestions = [
    {name: 'EmployeeFirstName',
    message: "What is the employee's first name?",
    default: null},

    {name: "EmployeeLastName",
    message: "What is the employee's last name?",
    default: null},

    {type: "list",
    name: "EmployeeRole",
    message: "What is the employee's Role",
    choices: ViewRoles,
    default: null},

    {type: "list",
    name: "EmployeeManager",
    message: "Who is the employee's manager",
    choices: ViewEmployees,
    default: null},
];

var addDepartmentQuestions = [
    {name: "addDept",
    message: "What is the name of the department?",
    default: null},
]

var addRoleQuestions = [
    {name: "addRole",
    message: "What is the name of the Role?",
    default: null},

    {name: "newSalary",
    message: "What is the salary of the Role?",
    default: null},

    {type: "list",
    name: 'newRoleDept',
    message: "Which department does the role belong to?",
    choices: ViewDepartments,
    default: null},
]

var changeRoleQuestions = [
    {type: "list",
    name: "EmployeeRoleSelect",
    message: "Which employee's role do you want to update?",
    choices: ViewEmployees,
    default: null},

    {type: "list",
    name: "EmployeeRole",
    message: "Which role do you want to assign the selected employee?",
    choices: ViewRoles,
    default: null}
]


function dbReader() {
 
inquirer
    .prompt(questions)
    .then((answers) => {
        if (answers.first == "Quit") {
            console.log("Thank You!")
        }
        else if (answers.first == "Add Employee") {
            inquirer
                .prompt(addEmployeeQuestions)
                .then((answers) => {
                  var FirstName = answers.EmployeeFirstName
                  var LastName = answers.EmployeeLastName
                  var placeholderMangaer1 = answers.EmployeeManager
                  var placeholderRole = answers.EmployeeRole

                  var placeholderMangaer2 = placeholderMangaer1.split(' ')
                  var placeholderMangaer = placeholderMangaer2[0];
                  
                  const getRole= new Promise((resolve, reject) => {
                  db.query(`SELECT role.id FROM role WHERE role.title = "${placeholderRole}"`,
                    function(err, result) {
                    var placeRole = result[0].id;
                      resolve(placeRole)
                  })}) 
                  
                  
                  const getManager = new Promise((resolve, reject) => {
                  db.query(`SELECT employee.id FROM employee WHERE employee.first_name = "${placeholderMangaer}"`,
                  function(err, result) {
                    console.log(result)
                    
                    let Manager = result[0].id
                    resolve(Manager)
                    if (err) {
                      console.log(err)
                    }
                  })})
                  
                  async function makeNewEmployee(a, b) {
                  db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
                  VALUES ("${FirstName}", "${LastName}", "${a}", "${b}")`, 
                  function(err, result){
                    console.log('Added Employee')
                    if (err) {
                      console.log(err)}
                    })
                  }

                  Promise.all([getRole, getManager]).then((values) => {
                    makeNewEmployee(values[0], values[1])

                  })
                })
                .catch((error) =>{
                    if (error.isTtyError) {
                        console.log(error)
                      }else {
                        console.log(error)
                      }})
        }
        else if (answers.first == "Update Employee Role") {
            inquirer
            .prompt(changeRoleQuestions)
            .then((answers) => {
              var placeholderMangaer1 = answers.EmployeeRoleSelect
              var placeholderMangaer2 = placeholderMangaer1.split(' ')
              var placeholderMangaer = placeholderMangaer2[0];
              var placeholderRole = answers.EmployeeRole

              const getManager = new Promise((resolve, reject) => {
                db.query(`SELECT employee.id FROM employee WHERE employee.first_name = "${placeholderMangaer}"`,
                function(err, result) {
                  console.log(result)
                  
                  let Manager = result[0].id
                  resolve(Manager)
                  if (err) {
                    console.log(err)
                  }
                })})

                const getRole= new Promise((resolve, reject) => {
                  db.query(`SELECT role.id FROM role WHERE role.title = "${placeholderRole}"`,
                    function(err, result) {
                    var placeRole = result[0].id;
                      resolve(placeRole)
                  })}) 

                  async function UpdateRole(a, b) {
                    db.query(`UPDATE employee SET role_id = '${a}' WHERE id = ${b}`, 
                    function(err, result){
                      console.log('Updated Role')
                      if (err) {
                        console.log(err)}
                      })
                    }
  
                    Promise.all([getRole, getManager]).then((values) => {
                      UpdateRole(values[0], values[1])
            })})

            .catch((error) =>{
                if (error.isTtyError) {
                    console.log(error)
                  }else {
                    console.log(error)
                  }})
        }
        else if (answers.first == "Add Roles") {
            inquirer
            .prompt(addRoleQuestions)
            .then((answers) => {
        
              const getDepartment= new Promise((resolve, reject) => {
                db.query(`SELECT department.id FROM department WHERE department.department = "${answers.newRoleDept}"`,
                  function(err, result) {
                  var placeDepartment = result[0].id;
                    resolve(placeDepartment)
                })}) 

                async function addNewRole(a) {
              db.query(
                `INSERT INTO role (title, salary, department_id)
                VALUES ("${answers.addRole}", "${answers.newSalary}", "${a}")`,
                function(err, result){
                  console.log('Added Role')
                  if (err) {
                    console.log(err)}
                  }
              )}

              Promise.all([getDepartment]).then((values) => {
                addNewRole(values[0])
              })
              

            })
            .catch((error) =>{
                if (error.isTtyError) {
                    console.log(error)
                  }else {
                    console.log(error)
                  }})
        }
        else if (answers.first == "Add Department") {
        inquirer
        .prompt(addDepartmentQuestions)
        .then((answers) => {
          db.query(
            `INSERT INTO department (department)
            VALUES ("${answers.addDept}")`
          )

        })
        .catch((error) =>{
            if (error.isTtyError) {
                console.log(error)
              }else {
                console.log(error)
              }})
        }
        else if (answers.first == "View All Departments") {
          db.query(
            `SELECT * FROM department`,
            function(err, results, fields) {
              DepartmentLists = results;
              
              let table = cTable.getTable(DepartmentLists)
              console.log(table);
            
              if (err) {
              console.log(err)
            }}
            )
            
            
         } 
        else if (answers.first == "View All Roles") {
          db.query(
            `SELECT role.id, role.title, role.salary, department.department FROM role LEFT JOIN department ON role.department_id=department.id`,
            function(err, results, fields) {
              RoleList = results;
              
              let table = cTable.getTable(RoleList)
              console.log(table);
            
              if (err) {
              console.log(err)
            }}
            )
         }
        else if (answers.first == "View All Employees") {
          db.query(
            `SELECT employee.id, employee.first_name, employee.last_name, department.department, role.title, role.salary FROM employee INNER JOIN role ON employee.role_id=role.id LEFT JOIN department ON role.department_id=department.id`,
            function(err, results, fields) {
              EmployeeList = results;
              
              let table = cTable.getTable(EmployeeList)
              console.log(table);
            
              if (err) {
              console.log(err)
            }}
            )         
         }
  })
  .catch((error) =>{
    if (error.isTtyError) {
        console.log(error)
      }else {
        console.log(error)
      }
  
  })
}
dbReader();
