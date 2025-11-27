const apiRouter = require("express").Router();
// const errorRouter = require("./error.routes");
const authRouter = require("./auth.routes");
const tokensRouter = require("./tokens.routes");
const userRouter = require("./user.routes");

apiRouter.use("/auth", authRouter);
apiRouter.use("/tokens", tokensRouter);
apiRouter.use("/users", userRouter);

// Простой middleware для обработки 404
apiRouter.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = apiRouter;
