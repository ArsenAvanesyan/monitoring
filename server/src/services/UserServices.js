const { User } = require("../../db/models");

class UserServices {
    static async addUser({
        login,
        password,
        token,
        email,
        photo,
    }) {
        try {
            const user = await User.create({
                login,
                password,
                token,
                email,
                photo,
            });
            return user ? user.get() : null;
        } catch (error) {
            throw new Error(error);
        }
    }

    static async getUserByEmail(email) {
        try {
            const user = await User.findOne({ where: { email } });
            return user ? user.get() : null;
        } catch (error) {
            throw new Error(error);
        }
    }

    static async getUserByLogin(login) {
        try {
            const user = await User.findOne({ where: { login } });
            return user ? user.get() : null;
        } catch (error) {
            throw new Error(error);
        }
    }

    static async updateUser(userId, updateData) {
        try {
            console.log('UserServices: Обновляем пользователя ID:', userId, 'с данными:', updateData);

            const [updatedRowsCount] = await User.update(updateData, {
                where: { id: userId },
            });

            console.log('UserServices: Количество обновленных строк:', updatedRowsCount);

            const user = await User.findByPk(userId);
            console.log('UserServices: Найденный пользователь после обновления:', user ? user.get() : null);

            return user ? user.get() : null;
        } catch (error) {
            console.error('UserServices: Ошибка обновления пользователя:', error);
            throw new Error(error);
        }
    }

    static async getAllUsers(where = {}) {
        try {
            const users = await User.findAll({ where });
            return users.map((user) => user.get());
        } catch (error) {
            throw new Error(error);
        }
    }

    static async getUserById(id) {
        try {
            const user = await User.findOne({ where: { id } });
            return user ? user.get() : null;
        } catch (error) {
            throw new Error(error);
        }
    }

    static async getUserByPhone(phone) {
        try {
            const user = await User.findOne({ where: { phone } });
            return user ? user.get() : null;
        } catch (error) {
            throw new Error(error);
        }
    }

    static async getUserByToken(token) {
        try {
            const user = await User.findOne({ where: { token } });
            return user ? user.get() : null;
        } catch (error) {
            throw new Error(error);
        }
    }
}

module.exports = UserServices;
