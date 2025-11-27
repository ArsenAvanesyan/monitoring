const apiRouter = require("express").Router();
// const errorRouter = require("./error.routes");
const authRouter = require("./auth.routes");
const tokensRouter = require("./tokens.routes");
const userRouter = require("./user.routes");
const purchasedProfileRouter = require("./purchasedProfile.routes");
const messageRouter = require("./message.routes");


apiRouter.use("/auth", authRouter);
apiRouter.use("/tokens", tokensRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/purchased-profiles", purchasedProfileRouter);
apiRouter.use("/messages", messageRouter);

// Простой middleware для обработки 404
apiRouter.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

module.exports = apiRouter;
