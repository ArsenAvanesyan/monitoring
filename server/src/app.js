const cors = require('cors');
require("dotenv").config();
const express = require("express");
const serverConfig = require("./config/serverConfig");
// const indexRouter = require("./routes/index.routes");
const PORT = process.env.PORT ?? 3000;
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

// Разрешить все источники (для разработки)
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true // если используете куки
}));

//конфигурация
serverConfig(app);
app.use(cookieParser());

//мaршрутизация
const indexRouter = require("./routes/index.routes");
app.use("/api", indexRouter);
app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.get("/", (req, res) => {
    res.json({ message: "Server is running!" });
});

app.listen(PORT, () => console.log(`listen port ${PORT}`));
