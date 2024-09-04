const addUser = `INSERT INTO user (username, password, age) VALUES (?,?,?)`;

const isUsernameExisy = `SELECT * FROM user where username = ?`;

module.exports = {addUser, isUsernameExisy}