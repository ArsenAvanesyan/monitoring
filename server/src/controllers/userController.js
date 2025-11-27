const verifyAccessToken = require("../middleware/verifyAccessToken");
const verifyRefreshToken = require("../middleware/verifyRefreshToken");
const UserServices = require("../services/UserServices");
const { processImages } = require("../utils/upload");

exports.updateUser = async (req, res) => {
    try {
        console.log('Получены данные для обновления:', req.body);
        console.log('ID пользователя:', res.locals.user.id);

        const { userData } = req.body;
        const updateData = {};

        // Основные поля профиля
        if ('login' in req.body) updateData.login = req.body.login;
        if ('email' in req.body) updateData.email = req.body.email;

        console.log('Данные для обновления в БД:', updateData);

        const user = await UserServices.updateUser(
            res.locals.user.id,
            updateData
        );

        console.log('Обновленный пользователь из БД:', user);

        if (!user) {
            res.status(404).json({ message: "Пользователь не найден" });
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
