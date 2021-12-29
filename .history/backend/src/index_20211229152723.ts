import express from "express"
import cors from "cors"
import axios from "axios"
import dotenv from "dotenv"
import { ethers } from "ethers";
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";
import mongoose from 'mongoose';
import User from "./models/User";
import PromoCode from "./models/PromoCode";
import nacl from "tweetnacl";
import * as naclUtil from "tweetnacl-util"

const COINBASE_URL_ETH = "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
const COINBASE_URL_SOL = "https://api.coinbase.com/v2/exchange-rates?currency=SOL"
const SOLANA_EXPLORER_URL: string = "https://api.devnet.solana.com"
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


app.post("/promocode", async (req, res) => {
    const { promoCode } = req.body
    await PromoCode.build({ promoCode: promoCode }).save()
    res.send("Promo code added")
})


app.post("/login/sol", async (req, res) => {
    const { signature, message, address } = req.body
    // const uint8Signature = new Uint8Array(signature.data)
    // const uint8Address = naclUtil.decodeUTF8(address)
    // console.log(uint8Address)
    // console.log("public key:", address)
    // console.log(naclUtil.decodeUTF8(address) instanceof Uint8Array)
    // console.log(naclUtil.decodeUTF8(address))
    console.log(message)
    const msgArr = Object.values(message)
    console.log(msgArr)
    console.log(msgArr instanceof Uint8Array)
    // console.log(new Uint8Array(msgArr))
    // console.log(new Uint8Array(msgArr) instanceof Uint8Array)
    console.log(naclUtil.decodeUTF8(message))

    const isValid = nacl.sign.detached.verify(msgArr, new Uint8Array(signature.data), new Uint8Array(address.data))
    console.log("isValid", isValid)
    // generate jwt send it as response
    const token = jwt.sign({
        data: { address, blockchain: "sol" }
    }, process.env.JWT_SECRET as string, {
        expiresIn: '2h'
    });

    // send jwt
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
    res.json({ success: true, message: "Logged in successfully" })
})



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
        data: { address: signer, type: "eth" }
    }, process.env.JWT_SECRET as string, {
        expiresIn: '2h'
    });

    // send jwt
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
    res.json({ success: true, message: "Logged in successfully" })
})

app.post("/register/promo", async (req, res) => {

    // need to collect address from frontend 
    // TODO: NOT HIGH PRIORITY. collect address and blockchain from JWT as opposed to input to avoid random people from spamming backend with addresses that dont exist. not a high priority problem as it only results in clogged username not really any other damage. as promo codes are limited

    const { promoCode, username, address, blockchain } = req.body
    console.log(promoCode)
    console.log(username)

    // check if promo code is valid (not used and exists)
    let existingCode = await PromoCode.findOne({ promoCode, address: "" }).exec()
    if (!existingCode) {
        return res.json({
            success: false,
            message: "Invalid promo code"
        })
    }

    // check if username available in DB
    let existingUser = await User.findOne({ username }).exec()
    if (existingUser) {
        return res.json({
            success: false,
            message: "Username already taken"
        })
    }

    // check if address not already used
    console.log(blockchain)
    if (blockchain == "ethereum") {
        existingUser = await User.findOne({ ETHAddress: address }).exec()
        if (existingUser) {
            return res.json({
                success: false,
                message: "Address already used"
            })
        }

        // add user
        const user = await User.build({
            username,
            ETHAddress: address
        })
        user.save()
        existingCode.address = address
        existingCode.blockchain = blockchain
        existingCode.save()

    } else if (blockchain == "solana") {
        existingUser = await User.findOne({ SOLAddress: address }).exec()
        if (existingUser) {
            return res.json({
                success: false,
                message: "Address already used"
            })
        }

        // add user
        const user = await User.build({
            username,
            SOLAddress: address
        })

        user.save()
        existingCode.address = address
        existingCode.blockchain = blockchain
        existingCode.save()

    } else {
        return res.json({
            success: false,
            message: "Invalid blockchain"
        })
    }

    res.json({
        success: true,
        message: "Promo code is valid"
    })
})


app.post("/register/sol", async (req, res) => {
    const { hash, username } = req.body
    // check if username available in DB and check if same address not already used to create some other username
    let existingUser = await User.findOne({ username }).exec()
    if (existingUser) {
        return res.json({
            success: false,
            message: "Username already taken"
        })
    }

    // check coinbase rate
    const coinbaseResponse = await axios.get(COINBASE_URL_SOL)
    const USDPerSOL = coinbaseResponse.data.data.rates.USD
    console.log(SOLANA_EXPLORER_URL)
    const solanaExplorerResponse = await axios.post(SOLANA_EXPLORER_URL, {
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
    const from = solanaExplorerResponse.data.result.transaction.message.accountKeys[0]
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

    // check if address already used
    existingUser = await User.findOne({ SOLAddress: from }).exec()
    if (existingUser) {
        return res.json({
            success: false,
            message: "Address already used"
        })
    }

    // if yes, then assign username in mongodb, otherwise reject
    const newuser = User.build({
        username,
        SOLAddress: from
    })
    await newuser.save()
    console.log("new user created!")
    return res.json(req.body)
})


app.post("/register/eth", async (req, res) => {
    // transaction data coming succesfully in req.body!
    const { tx, username } = req.body

    // check if username available in DB
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
            message: "Address already used"
        })
    }

    // if yes, then assign username in mongodb, otherwise reject
    const newuser = User.build({
        username,
        ETHAddress: txDetailsFromEtherscan.from.toUpperCase()
    })
    await newuser.save()
    console.log("new user created!")
    return res.json(req.body)
})

// configure mongodb connection
try {
    mongoose.connect(process.env.MONGO_URI as string, {}, (e) => {
        if (e) { console.log(e) }
        console.log("connected to mongodb")
        app.listen(3001, () => {
            console.log('listening on port 3001')
        })

    })
} catch (err) {
    console.log("could not connect to mongodb and app uninitialized")
}