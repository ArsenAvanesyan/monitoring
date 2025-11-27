const {
    signUp,
    signIn,
    logout,
    refreshToken,
  } = require("../controllers/authController");
  
  const authRouter = require("express").Router();
  
  authRouter.post("/signup", signUp);
  authRouter.post("/signin", signIn);
  authRouter.delete("/logout", logout);
  authRouter.post("/refresh", refreshToken);
  
  module.exports = authRouter;
  