const verifyAccessToken = require("../middleware/verifyAccessToken");
const verifyRefreshToken = require("../middleware/verifyRefreshToken");
const UserServices = require("../services/UserServices");
const { processImages } = require("../utils/upload");

exports.updateUser = async (req, res) => {
    try {
        console.log('Получены данные для обновления:', req.body);
        console.log('ID пользователя:', res.locals.user.id);

        const updateData = {};
        const bcrypt = require('bcryptjs');

        // Основные поля профиля
        if ('login' in req.body) updateData.login = req.body.login;
        if ('email' in req.body) updateData.email = req.body.email;

        // Обработка пароля - требуется старый пароль для проверки
        if ('password' in req.body && req.body.password) {
            // Проверяем, что передан старый пароль
            if (!req.body.oldPassword) {
                return res.status(400).json({ message: "Необходимо указать старый пароль" });
            }

            // Получаем текущего пользователя для проверки старого пароля
            const currentUser = await UserServices.getUserById(res.locals.user.id);
            if (!currentUser) {
                return res.status(404).json({ message: "Пользователь не найден" });
            }

            // Проверяем старый пароль
            const isOldPasswordValid = await bcrypt.compare(req.body.oldPassword, currentUser.password);
            if (!isOldPasswordValid) {
                return res.status(400).json({ message: "Старый пароль неверен" });
            }

            // Хешируем новый пароль
            updateData.password = await bcrypt.hash(req.body.password, 8);
        }

        // Фото обновляется только через отдельный endpoint /avatar с multer

        console.log('Данные для обновления в БД:', updateData);

        const user = await UserServices.updateUser(
            res.locals.user.id,
            updateData
        );

        console.log('Обновленный пользователь из БД:', user);

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error('Ошибка обновления пользователя:', error);
        res.status(500).json({ error: error.message });
    }
},

    exports.updateAvatarUser = async (req, res) => {
        try {
            const userId = res.locals.user.id;
            if (req.file) {
                const avatarPath = await processImages(req.file.buffer);
                const user = await UserServices.updateUser(userId, {
                    photo: `/images/${avatarPath}`,
                });
                if (!user) {
                    return res.status(404).json({ message: "Пользователь не найден" });
                }
                return res.status(200).json({ user });
            } else {
                return res.status(400).json({ message: "Файл не был загружен." });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };


exports.getAllUsers = async (req, res) => {
    try {
        const where = {};
        if (req.query.role) where.role = req.query.role;
        const users = await UserServices.getAllUsers(where);
        res.status(200).json({ message: "success", users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserServices.getUserById(id);
        if (user) {
            res.status(200).json({ message: "success", user });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const userId = res.locals.user.id;
        const user = await UserServices.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.refreshUserToken = async (req, res) => {
    try {
        const userId = res.locals.user.id;
        const generateToken = require("../utils/generateToken");

        // Получаем текущего пользователя
        const user = await UserServices.getUserById(userId);
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        // Проверяем, прошло ли 24 часа с последнего обновления
        const now = new Date();
        const lastRefresh = user.lastTokenRefresh ? new Date(user.lastTokenRefresh) : null;

        if (lastRefresh) {
            const hoursSinceRefresh = (now - lastRefresh) / (1000 * 60 * 60);
            if (hoursSinceRefresh < 24) {
                const hoursRemaining = Math.ceil(24 - hoursSinceRefresh);
                return res.status(429).json({
                    message: `Токен можно обновить только раз в сутки. Попробуйте через ${hoursRemaining} часов.`
                });
            }
        }

        // Генерируем новый токен
        const newToken = generateToken();

        // Обновляем токен и дату последнего обновления
        const updatedUser = await UserServices.updateUser(userId, {
            token: newToken,
            lastTokenRefresh: now
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        res.status(200).json({
            user: updatedUser,
            message: "Токен успешно обновлен"
        });
    } catch (error) {
        console.error('Ошибка обновления токена:', error);
        res.status(500).json({ error: error.message });
    }
};
