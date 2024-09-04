var jwt = require('jsonwebtoken');

const auth = (req, res, next)=>{
    try {
        const token = req.cookies.token;

        if(!token){
            res.status(400).json({ message: "Please login first" })
            return;
        }

        jwt.verify(token, 'instagramPrivetkey', function(err, decoded) {
            if (err) {
                res.status(400).json({ message: "Error in jwt Verify" })
                return;
            }

            req.userid = decoded.userid;
            next();
          });
        

    } catch (error) {
        console.log("Error in auth middleware");
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
}

module.exports={auth}