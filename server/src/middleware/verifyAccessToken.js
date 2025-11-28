// ./middleware/verifyAccessToken.js

require("dotenv").config();
const jwt = require("jsonwebtoken");


function verifyAccessToken(req, res, next) {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Access token is required" });
    }

    const accessToken = req.headers.authorization.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({ message: "Invalid access token format" });
    }

    const { user } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    res.locals.user = user;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log("Access token expired");
      return res.status(401).json({ message: "Access token expired" });
    }
    console.log("Invalid access token:", error.message);
    return res.status(401).json({ message: "Invalid access token" });
  }
}

module.exports = verifyAccessToken;