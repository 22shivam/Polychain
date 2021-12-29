import express from "express"
import cors from "cors"
import axios from "axios"
import dotenv from "dotenv"
import { ethers } from "ethers";
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";
import mongoose from 'mongoose';
import User from "./models/User";



const COINBASE_URL_ETH = "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
const COINBASE_URL_SOL = "https://api.coinbase.com/v2/exchange-rates?currency=SOL"
const SOLANA_EXPLORER_URL = process.env.SOLANA_EXPLORER_URL
const PROMO_CODE = ["shivamthegreat", "shivamthebest", "shivamtheworse"]

dotenv.config()
const app = express()
app.use(
    express.urlencoded({
        extended: false
    })
)
app.use(express.json())
app.use(cors())
app.use(cookieParser(process.env.COOKIE_SECRET))



app.post("/login/eth", async (req, res) => {
    const { signature, message, address } = req.body
    console.log(signature)
    console.log(address)
    console.log(message)


    const signer = await ethers.utils.verifyMessage(message, signature)
    console.log("signer", signer)
    if (signer.toUpperCase() !== address.toUpperCase()) {
        return res.status(401).send("Invalid signature")
    }

    // generate jwt send it as response
    const token = jwt.sign({
        data: signer
    }, process.env.JWT_SECRET as string, {
        expiresIn: '2h'
    });

    // send jwt
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
    res.json({ success: true, message: "Logged in successfully" })
})

app.post("/register/promo", async (req, res) => {
    const { promoCode, username } = req.body
    console.log(promoCode)
    console.log(username)
    if (PROMO_CODE.includes(promoCode)) {
        res.json({
            success: true,
            message: "Promo code is valid"
            // add username to mongoDB
        })
    } else {
        res.json({
            success: false,
            message: "Promo code is invalid"
        })
    }
})


app.post("/register/sol", async (req, res) => {
    console.log("req rcvd")
    console.log(req.body)
    const { hash, username } = req.body
    // check if username available in DB and check if same address not already used to create some other username

    // check coinbase rate
    const coinbaseResponse = await axios.get(COINBASE_URL_SOL)
    const USDPerSOL = coinbaseResponse.data.data.rates.USD
    console.log(USDPerSOL)
    const solanaExplorerResponse = await axios.post(SOLANA_EXPLORER_URL as string, {
        "jsonrpc": "2.0",
        "id": 1,
        method: "getTransaction",
        params: [
            hash,
            "json"
        ]
    }, {
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        }
    })

    if (!solanaExplorerResponse.data) {
        return res.json({
            success: "false",
            message: "Transaction not found on Solana Explorer"
        })
    }

    const to = solanaExplorerResponse.data.result.transaction.message.accountKeys[1]
    const fee = solanaExplorerResponse.data.result.meta.fee
    const preBalanceSender = solanaExplorerResponse.data.result.meta.preBalances[0]
    const postBalanceSender = solanaExplorerResponse.data.result.meta.postBalances[0]

    const solPaid = (preBalanceSender - postBalanceSender - fee) / (10 ** 9)
    const solPaidUSD = solPaid * USDPerSOL
    console.log(solPaidUSD)

    // verify that amount paid to right address
    console.log(to)
    if (to.toUpperCase() !== "AA6BQLGTZYPPFFH2R9XLDUDIBWCEMLKKDRTZMPQESEIS") {
        return res.json({
            success: false,
            message: "USD paid to wrong address"
        })
    }

    // check if appropriate amount paid in eth
    if (solPaidUSD < 4.5) {
        return res.json({
            success: false,
            message: "Not enough USD paid"
        })
    }

    // if yes, then assign username in mongodb, otherwise reject

    return res.json(req.body)
})


app.post("/register/eth", async (req, res) => {
    // transaction data coming succesfully in req.body!
    const { tx, username } = req.body

    // check if username available in DB and check if same address not already used to create some other username
    let existingUser = await User.findOne({ username }).exec()
    if (existingUser) {
        return res.json({
            success: false,
            message: "Username already taken"
        })
    }

    // check coinbase rate
    const coinbaseResponse = await axios.get(COINBASE_URL_ETH)
    const USDPerETH = coinbaseResponse.data.data.rates.USD

    // check whether transaction hash is there on etherscan and check the amount paid
    const etherscanResponse = await axios.get(`https://api-ropsten.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${tx.hash}&apikey=${process.env.ETHERSCAN_API_KEY}`)
    const txDetailsFromEtherscan = etherscanResponse.data.result

    if (!txDetailsFromEtherscan) {
        return res.json({
            success: "false",
            message: "Transaction not found on etherscan"
        })
    }
    const ethPaid = parseInt(txDetailsFromEtherscan.value, 16) / 10 ** 18
    const ethPaidUSD = ethPaid * USDPerETH

    // verify that amount paid to right address
    if (txDetailsFromEtherscan.to.toUpperCase() !== "0X76AEB5092D8EABCEC324BE739B8BA5DF473F0055") {
        return res.json({
            success: false,
            message: "USD paid to wrong address"
        })
    }

    // check if appropriate amount paid in eth
    if (ethPaidUSD < 4.5) {
        return res.json({
            success: false,
            message: "Not enough USD paid"
        })
    }

    // check if address not already used
    existingUser = await User.findOne({ ETHAddress: txDetailsFromEtherscan.from.toUpperCase() }).exec()
    if (existingUser) {
        return res.json({
            success: false,
            message: "Username already taken"
        })
    }

    // if yes, then assign username in mongodb, otherwise reject
    const newuser = User.build({
        username,
        ETHAddress: txDetailsFromEtherscan.from.toUpperCase()
    })
    console.log("reached here")
    await newuser.save()

    return res.json(req.body)
})

// configure mongodb connection
try {
    mongoose.connect(process.env.MONGO_URI as string, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true
    }, (e) => {
        if (e) { console.log(e) }
        console.log("connected to mongodb")
        app.listen(3001, () => {
            console.log('listening on port 3001')
        })

    })
} catch (err) {
    console.log("could not connect to mongodb and app uninitialized")
    console.log(err)
}