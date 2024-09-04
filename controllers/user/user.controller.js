const bcrypt = require('bcrypt');
const { pool } = require('../../config/db');
const { addUser, isUsernameExisy } = require('../../queries/users/user.query');
var jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    try {
        const { username, password, age } = req.body;
        if (!username || !password) {
            res.status(400).json({ message: "username and password are required" })
            return;
        }

        const isUsername =  await pool.promise().query(isUsernameExisy, [username]);
      if(isUsername[0].length>0){
        res.status(400).json({ message: "Username already in use" })
        return;
      }
        
        bcrypt.hash(password, 3, async function (err, hash) {
            if (err) {
                res.status(400).json({ message: "Error while hashing the password" })
                return;
            }

            await pool.promise().query(addUser, [username, hash, age]);

            res.status(201).json({ message: "User registerd successfully" })


        });


    } catch (error) {
        console.log("Error in registerUser controller");
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
}

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ message: "username and password are required" })
            return;
        }
       
        const isUsername =  await pool.promise().query(isUsernameExisy, [username]);

        if(isUsername[0].length<=0){
            res.status(400).json({ message: "Username is not registered" })
            return;
          }

          let hashPassword = isUsername[0][0].password
          let userid = isUsername[0][0].id

        bcrypt.compare(password, hashPassword, function(err, result) {
            if (err) {
                res.status(400).json({ message: "Error while hashing the password" })
                return;
            }

            if(result==true){
                let token = jwt.sign({ userid: userid }, "instagramPrivetkey");
                
                // req.cookie('token', token)
                res.cookie('token', token).status(200).json({ message: "Login successfully", token });


            }else{
                res.status(400).json({ message: "Incorrect password or username" })
                return;
            }
        });


    } catch (error) {
        console.log("Error in loginUser controller");
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = { registerUser, loginUser }