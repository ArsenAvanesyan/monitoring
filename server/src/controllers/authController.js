const jwtConfig = require("../config/jwtConfig");
const generateTokens = require("../utils/generateTokens");

exports.signUp = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            password,
            email,
            photo
        } = req.body;

        let userByEmail = await UserServices.getUserByEmail(email);

        if (
            firstName.trim() === "" ||
            lastName.trim() === "" ||
            email.trim() === "" ||
            password.trim() === ""
        ) {
            console.log("Заполни все поля!");
            return res.status(400).json({ message: "Заполни все поля!" });
        }

        if (userByEmail) {
            return res.status(400).json({ message: "Такая почта уже зарегистрирована!" });
        }

        let user = await UserServices.addUser({
            firstName,
            lastName,
            password: await bcrypt.hash(password, 8),
            email,
            photo,
            cookingExp
        })

        delete user.password
        res.locals.user = user
        const { accessToken, refreshToken } = generateTokens({ user })
        res.status(201).cookie(jwtConfig.refresh.type, refreshToken, {
            httpOnly: true,
            maxAge: jwtConfig.refresh.expiresIn,
            sameSite: 'lax',
            secure: false
        }).json({ user, accessToken })
        return
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.signIn = async (req, res) => {
    try {
        const { email, password } = req.body
        if (email.trim() === "" || password.trim() === "") {
            console.log("Заполните все поля")
            return
        }
        const user = await UserServices.getUserByEmail(email)
        if (user) {
            const compare = await bcrypt.compare(password, user.password)
            if (compare) {
                delete user.password
                res.locals.user = user
                const { accessToken, refreshToken } = generateTokens({ user })
                res.status(200).cookie(jwtConfig.refresh.type, refreshToken, {
                    httpOnly: true,
                    maxAge: jwtConfig.refresh.expiresIn,
                    sameSite: 'lax',
                    secure: false
                }).json({ user, accessToken })
                return
            }
        }
        res.status(400).json({ message: "Почта или пароль введены неверно!" })
    } catch ({ message }) {
        res.status(500).json({ error: message })
    }
}

exports.logout = async (req, res) => {
    try {
        res.locals.user = null;
        res
            .clearCookie("refreshToken")
            .status(200)
            .json({ message: "Успешный выход!" });
    } catch ({ message }) {
        res.status(500).json({ error: message });
    }
};
