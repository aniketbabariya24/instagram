const mysql = require("mysql2");


const pool = mysql.createPool({
    host:"localhost",
    port:3306,
    database:"sakila",
    password:"232410",
    user:"root"
})

pool.getConnection((err, connection)=>{
    if(err){
        console.log("Error while connecting the database")
        return;
    }
    console.log("Connected to database");
    connection.release();
})

module.exports = {pool}