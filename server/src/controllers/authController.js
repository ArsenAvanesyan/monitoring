const bcrypt = require('bcryptjs');
const jwtConfig = require("../config/jwtConfig");
const generateTokens = require("../utils/generateTokens");
const UserServices = require("../services/UserServices");
const generateToken = require("../utils/generateToken");
const validateEmail = require("../utils/validateEmail");

exports.signUp = async (req, res) => {
    try {
        const {
            login,
            password,
            email,
            photo
        } = req.body;

        // Проверка заполненности полей
        if (
            !login || login.trim() === "" ||
            !email || email.trim() === "" ||
            !password || password.trim() === ""
        ) {
            return res.status(400).json({ message: "Заполни все поля!" });
        }

        // Валидация email
        if (!validateEmail(email)) {
            return res.status(400).json({ message: "Некорректный формат email!" });
        }

        // Нормализуем email (приводим к нижнему регистру)
        const normalizedEmail = email.trim().toLowerCase();

        // Проверка существования пользователя с таким email
        let userByEmail = await UserServices.getUserByEmail(normalizedEmail);
        if (userByEmail) {
            return res.status(400).json({ message: "Такая почта уже зарегистрирована!" });
        }

        // Проверка существования пользователя с таким login
        const userByLogin = await UserServices.getUserByLogin(login);
        if (userByLogin) {
            return res.status(400).json({ message: "Пользователь с таким логином уже существует!" });
        }

        // Генерация токена (16 символов из 8 байт)
        const token = generateToken();

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 8);

        // Создание пользователя
        let user = await UserServices.addUser({
            login: login.trim(),
            password: hashedPassword,
            email: normalizedEmail,
            token,
            photo: photo ? photo.trim() : null
        });

        // Удаляем пароль из ответа
        delete user.password;

        res.locals.user = user;
        const { accessToken, refreshToken } = generateTokens({ user });

        res.status(201).cookie(jwtConfig.refresh.type, refreshToken, {
            httpOnly: true,
            maxAge: jwtConfig.refresh.expiresIn,
            sameSite: 'lax',
            secure: false
        }).json({ user, accessToken });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: error.message });
    }
}

exports.signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Проверка заполненности полей
        if (!email || email.trim() === "" || !password || password.trim() === "") {
            return res.status(400).json({ message: "Заполните все поля!" });
        }

        // Валидация email
        if (!validateEmail(email)) {
            return res.status(400).json({ message: "Некорректный формат email!" });
        }

        // Поиск пользователя по email
        const user = await UserServices.getUserByEmail(email.trim().toLowerCase());

        if (!user) {
            return res.status(400).json({ message: "Почта или пароль введены неверно!" });
        }

        // Проверка пароля
        const compare = await bcrypt.compare(password, user.password);

        if (!compare) {
            return res.status(400).json({ message: "Почта или пароль введены неверно!" });
        }

        // Удаляем пароль из ответа
        delete user.password;

        res.locals.user = user;
        const { accessToken, refreshToken } = generateTokens({ user });

        res.status(200).cookie(jwtConfig.refresh.type, refreshToken, {
            httpOnly: true,
            maxAge: jwtConfig.refresh.expiresIn,
            sameSite: 'lax',
            secure: false
        }).json({ user, accessToken });
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        res.status(500).json({ error: error.message });
    }
}

exports.logout = async (req, res) => {
    try {
        res.locals.user = null;
        res
            .clearCookie(jwtConfig.refresh.type)
            .status(200)
            .json({ message: "Успешный выход!" });
    } catch (error) {
        console.error('Ошибка выхода:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const user = res.locals.user;
        if (!user) {
            return res.status(401).json({ message: "Пользователь не найден" });
        }

        delete user.password;
        const { accessToken, refreshToken } = generateTokens({ user });

        res.cookie(jwtConfig.refresh.type, refreshToken, {
            httpOnly: true,
            maxAge: jwtConfig.refresh.expiresIn,
            sameSite: 'lax',
            secure: false
        }).json({ user, accessToken });
    } catch (error) {
        console.error('Ошибка обновления токена:', error);
        res.status(500).json({ error: error.message });
    }
};
