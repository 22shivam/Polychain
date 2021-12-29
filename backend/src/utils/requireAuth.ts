import jwt from "jsonwebtoken";
import User from "../models/User";

const requireAuth = async (req: any, res: any, next: any) => {
    try {
        const token = req.cookies.token || ""
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { data: { address: string, blockchain: string } }
        if (!decoded) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }

        if (decoded.data.blockchain = "eth") {
            const user = await User.findOne({ ETHAddress: decoded.data.address })
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" })
            }
            req.user = user
        }

        const user = await User.findOne({ _id: decoded.data.address })

        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()

    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}