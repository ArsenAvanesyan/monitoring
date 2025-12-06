const bcrypt = require('bcryptjs');
const axios = require('axios');
const jwtConfig = require("../config/jwtConfig");
const generateTokens = require("../utils/generateTokens");
const UserServices = require("../services/UserServices");
const generateToken = require("../utils/generateToken");
const validateEmail = require("../utils/validateEmail");

/**
 * Проверка reCAPTCHA токена через Google API
 */
async function verifyRecaptcha(token) {
    if (!token) {
        return false;
    }

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
        console.warn('SECRET_KEY не установлен в переменных окружения');
        return true; // Если ключ не установлен, пропускаем проверку
    }

    try {
        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
                secret: secretKey,
                response: token
            }
        });

        return response.data && response.data.success === true;
    } catch (error) {
        console.error('Ошибка при проверке reCAPTCHA:', error);
        return false;
    }
}

exports.signUp = async (req, res) => {
    try {
        const {
            login,
            password,
            email
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
            token
        });

        // Удаляем пароль из ответа
        delete user.password;

        res.locals.user = user;
        const { accessToken, refreshToken } = generateTokens({ user });

        res.status(201).cookie(jwtConfig.refresh.type, refreshToken, {
            httpOnly: true,
            maxAge: jwtConfig.refresh.expiresInMs,
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
        const { email, password, recaptchaToken } = req.body;

        // Проверка заполненности полей
        if (!email || email.trim() === "" || !password || password.trim() === "") {
            return res.status(400).json({ message: "Заполните все поля!" });
        }

        // Валидация email
        if (!validateEmail(email)) {
            return res.status(400).json({ message: "Некорректный формат email!" });
        }

        // Проверка reCAPTCHA, если включена
        if (process.env.SECRET_KEY) {
            if (!recaptchaToken) {
                return res.status(400).json({ message: "Пожалуйста, подтвердите, что вы не робот" });
            }

            const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
            if (!isRecaptchaValid) {
                return res.status(400).json({ message: "Ошибка проверки reCAPTCHA. Попробуйте еще раз." });
            }
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
            maxAge: jwtConfig.refresh.expiresInMs,
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
            maxAge: jwtConfig.refresh.expiresInMs,
            sameSite: 'lax',
            secure: false
        }).json({ user, accessToken });
    } catch (error) {
        console.error('Ошибка обновления токена:', error);
        res.status(500).json({ error: error.message });
    }
};
