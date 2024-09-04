const addPostQuery = `INSERT INTO post (title, caption, userid) VALUES (?,?,?)`;

const commentPostQuery = `UPDATE post set comments = ? WHERE id = ?`;

const likePostQuery = `UPDATE post set likes = ? WHERE id = ?`;

const sharePostQuery = `UPDATE post set shares = ? WHERE id = ?`;

const getPostById = `SELECT * FROM post where id = ?`;

const getpostByUser = `SELECT * FROM post where userid = ?`;


module.exports = {getpostByUser, getPostById, addPostQuery, commentPostQuery, likePostQuery, sharePostQuery}