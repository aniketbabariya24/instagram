const bcrypt = require('bcrypt');
const { pool } = require('../../config/db');
const { addPostQuery, commentPostQuery, likePostQuery, sharePostQuery, getPostById, getpostByUser } = require('../../queries/posts/post.query');
var jwt = require('jsonwebtoken');

const addPost = async (req, res) => {
    try {
        const { title, caption } = req.body;

        const userid = req.userid;

        if (!title) {
            res.status(400).json({ message: "Title is required" })
            return;
        }

        await pool.promise().query(addPostQuery, [title, caption, userid]);

        res.status(201).json({ message: "Post added successfully" })

    } catch (error) {
        console.log("Error in addPost controller");
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
}

const likePost = async (req, res) => {
    try {
        const { postid } = req.body;

        const userid = req.userid;

        if (!postid) {
            return res.status(400).json({ message: "Postid is required" });
        }

        const [rows] = await pool.promise().query(getPostById, [postid]);

        if (rows.length <= 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        let likes = [];

        if (rows[0].likes) {
            try {
                likes = JSON.parse(rows[0].likes);
                if (!Array.isArray(likes)) {
                    likes = [];
                }
            } catch (error) {
                console.error("Error parsing likes JSON:", error);
                return res.status(500).json({ message: "Error processing likes data" });
            }
        }

        if (!likes.includes(userid)) {
            likes.push(userid);
        }

        const jsonLikes = JSON.stringify(likes);

        const likePostQuery = 'UPDATE post SET likes = ? WHERE id = ?';
        await pool.promise().query(likePostQuery, [jsonLikes, postid]);

        return res.status(200).json({ message: "Post liked successfully" });
    } catch (error) {
        console.log("Error in likePost controller");
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const sharePost = async (req, res) => {
    try {
        const { postid } = req.body;

        // User id comes from auth middleware
        const userid = req.userid;

        if (!postid) {
            return res.status(400).json({ message: "Postid is required" });
        }

        const [rows] = await pool.promise().query(getPostById, [postid]);

        if (rows.length <= 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        let shares = [];

        if (rows[0].shares) {
            try {
                shares = JSON.parse(rows[0].shares);
                if (!Array.isArray(shares)) {
                    shares = [];
                }
            } catch (error) {
                return res.status(500).json({ message: "Error processing shares data" });
            }
        }

            shares.push(userid);
      
        const jsonShares = JSON.stringify(shares);

        await pool.promise().query(sharePostQuery, [jsonShares, postid]);

        return res.status(200).json({ message: "Post shared successfully" });
    } catch (error) {
        console.log("Error in sharePost controller");
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const commentPost = async (req, res) => {
    try {
        const { postid, comment } = req.body;


        const userid = req.userid;

        const [rows] = await pool.promise().query(getPostById, [postid]);

        if (rows.length <= 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        let comments = [];


        if (typeof rows[0].comments === 'string') {
            try {
                comments = JSON.parse(rows[0].comments);
            } catch (error) {
                return res.status(500).json({ message: "Error processing comments data" });
            }
        } else if (Array.isArray(rows[0].comments)) {
            comments = rows[0].comments;
        }


        let commentObject = {
            comment,
            userid,
            replies: []
        };


        const jsonComments = JSON.stringify(comments);

        await pool.promise().query(commentPostQuery, [jsonComments, postid]);

        res.status(200).json({ message: "You commented successfully" });

    } catch (error) {
        console.log("Error in commentPost controller");
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const replyComment = async (req, res) => {
    try {
        const { postid, commentIndex, reply } = req.body;


        const userid = req.userid;

        const [rows] = await pool.promise().query(getPostById, [postid]);

        if (rows.length <= 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        let comments = rows[0].comments ? JSON.parse(rows[0].comments) : [];

        if (commentIndex >= comments.length || commentIndex < 0) {
            return res.status(400).json({ message: "Invalid comment index" });
        }

        comments[commentIndex].replies.push({ reply, userid });
        const jsonComments = JSON.stringify(comments);


        await pool.promise().query(commentPostQuery, [jsonComments, postid]);

        res.status(200).json({ message: "Reply added successfully" });

    } catch (error) {
        console.log("Error in replyComment controller");
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const reReplyComment = async (req, res) => {
    try {
        const { postid, commentIndex, replyIndex, reply } = req.body;

        // User id comes from auth middleware
        const userid = req.userid;

        const [rows] = await pool.promise().query(getPostById, [postid]);

        if (rows.length <= 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        let comments = rows[0].comments ? JSON.parse(rows[0].comments) : [];

        if (commentIndex >= comments.length || commentIndex < 0) {
            return res.status(400).json({ message: "Invalid comment index" });
        }

        let comment = comments[commentIndex];
        if (replyIndex >= comment.replies.length || replyIndex < 0) {
            return res.status(400).json({ message: "Invalid reply index" });
        }


        comment.replies[replyIndex].replies.push({ reply, userid });


        const jsonComments = JSON.stringify(comments);

        await pool.promise().query(commentPostQuery, [jsonComments, postid]);

        res.status(200).json({ message: "Re-reply added successfully" });

    } catch (error) {
        console.log("Error in reReplyComment controller");
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const getPostByIdController = async (req, res) => {
    try {
        const { postid } = req.body;
        // User id comes from auth middleware
        const userid = req.userid;
        if (!postid) {
            res.status(400).json({ message: "Postid is required" })
            return;
        }


        const post = await pool.promise().query(getPostById, [postid]);

        if (post[0].length <= 0) {
            res.status(400).json({ message: "No post found" })
            return;
        }
        let commentCount = post[0][0].comments?.length || 0;
        let shareCount = post[0][0].shares?.length || 0;
        let myUpdatedPost = {
            ...post[0][0], commentCount, shareCount
        }



        res.status(200).json({ post: myUpdatedPost });



    } catch (error) {
        console.log("Error in loginUser controller");
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
}

const getPostByUserController = async (req, res) => {
    try {
        // User id comes from auth middleware
        const userid = req.userid;


        const post = await pool.promise().query(getpostByUser, [userid]);

        if (post[0].length <= 0) {
            res.status(400).json({ message: "No post found" })
            return;
        }

        res.status(200).json({ post });

    } catch (error) {
        console.log("Error in loginUser controller");
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }

}

module.exports = { addPost, likePost, sharePost, commentPost, reReplyComment, replyComment, getPostByIdController, getPostByUserController }