const { where } = require("sequelize");
const { User } = require("../../db/models")

class UserServices {
    static async addUser({
        firstName,
        lastName,
        password,
        email,
        photo
    }) {
        try {

            const user = await User.create({
                firstName,
                lastName,
                password,
                email,
                photo
            })
            return user ? user.get() : null;

        } catch (error) {
            throw new Error(error);
        }
    }

    static async getUserByEmail(email) {
        try {
            const user = await User.findOne({ where: { email } })
            return user ? user.get() : null
        } catch (error) {
            throw new Error(error);

        }
    }
}