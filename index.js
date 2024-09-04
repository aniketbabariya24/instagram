const express = require("express");
const { pool } = require("./config/db");
const { addUser } = require("./queries/users/user.query");
const { userRoutes } = require("./routes/users/user.routes");
var cookieParser = require('cookie-parser');
const { postRoutes } = require("./routes/posts/posts.routes");
const { auth } = require("./middleware/auth");
const app= express();
app.use(cookieParser())
app.use(express.json());


app.use('/user', userRoutes)
// app.use(auth)
app.use('/post', postRoutes)




app.listen(8080, async(req, res)=>{
    try {
        await pool;
       
    } catch (error) {
        console.log("Error while connecting to database")
        console.log(error);
    }
    console.log("server is running on port: 8080")
})