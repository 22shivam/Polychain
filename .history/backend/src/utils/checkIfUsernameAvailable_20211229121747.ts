import User from "../models/User"

const checkIfUsernameAvailable = async (username: string, res: any) => {
    let existingUser = await User.findOne({ username }).exec()
    if (existingUser) {
        return res.json({
            success: false,
            message: "Username already taken"
        })
    }
}

export default checkIfUsernameAvailable