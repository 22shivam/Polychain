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
import { Web3Provider } from "@ethersproject/providers";
const web3 = require('@solana/web3.js')

const COINBASE_URL_ETH = "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
const COINBASE_URL_SOL = "https://api.coinbase.com/v2/exchange-rates?currency=SOL"
const SOLANA_EXPLORER_URL: string = "https://api.devnet.solana.com"

dotenv.config()
const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://mypage.com',
    ],
    credentials: true
}))
app.use(cookieParser(process.env.COOKIE_SECRET))


app.post("/userDetails/update", (req: any, res: any) => {
    // TODO: HIGH PRIOERITY. DO VALIDATION FOR INPUTS

    // update details associated with the account that has the address in the cookie as having cookie means u have that address. 
    const token = req.cookies.token
    jwt.verify(token, process.env.COOKIE_SECRET as string, async (err: any, decoded: any) => {
        if (err) { // not logged in
            return res.json({
                success: "false",
                message: "Invalid token"
            })
        } else { // logged in
            let { address, blockchain } = decoded.data
            address = address.toUpperCase()
            let { ETHAddress, BTCAddress, DESOAddress, SOLAddress, bio, profilePic } = req.body
            ETHAddress = ETHAddress && ETHAddress.toUpperCase()
            BTCAddress = BTCAddress && BTCAddress.toUpperCase()
            DESOAddress = DESOAddress && DESOAddress.toUpperCase()
            SOLAddress = SOLAddress && SOLAddress.toUpperCase()

            if (blockchain == "eth") { // logged in with eth
                let user = User.findOne({ ETHAddress: address })
                if (!user) { // no username for logged in acct
                    return res.json({
                        success: "false",
                        message: "No corresponding Username for this address found"
                    })
                } else { // username found for logged in account with eth
                    console.log(address)
                    console.log(ETHAddress)
                    if (ETHAddress != address.toUpperCase()) { // primary eth address changed )
                        let user = await User.findOne({ ETHAddress: ETHAddress })
                        if (user) { // new primary eth address is already taken
                            return res.json({
                                success: "false",
                                message: "Ethereum address is already associated with another Username"
                            })
                        } else { // new primary eth address is available
                            // now check if sol address is alrdy taken
                            let user = await User.findOne({ SOLAddress })
                            if (user && user.ETHAddress !== address.toUpperCase() && SOLAddress) { // sol address is already taken by SOMEONE ELSE
                                return res.json({
                                    success: "false",
                                    message: "Solana address is already associated with another Username"
                                })
                            } else { // sol address is available
                                // sol addr is available + eth addr is available -- therefore make changes!
                                console.log("user updated")
                                res.clearCookie("token") // NO RETURN here as need to make updates
                                user = await User.findOneAndUpdate({ ETHAddress: address }, { ETHAddress, SOLAddress, BTCAddress, DESOAddress, bio, profilePic })
                                return res.json({
                                    success: "true",
                                    message: "Changes saved",
                                    user,
                                    loggedOut: "true"
                                })
                            }


                        }

                    } else { // primary eth address not changed
                        // check if sol address is alrdy taken
                        let user = await User.findOne({ SOLAddress })
                        if (user && user.ETHAddress !== address.toUpperCase() && SOLAddress) { // sol address is already taken by SOMEONE ELSE
                            return res.json({
                                success: "false",
                                message: "Solana address is already associated with another Username"
                            })
                        } else { // sol address is available
                            // sol addr is available + eth addr is available -- therefore make changes!
                            console.log("user updated")
                            user = await User.findOneAndUpdate({ ETHAddress: address }, { ETHAddress, SOLAddress, BTCAddress, DESOAddress, bio, profilePic })
                            return res.json({
                                success: "true",
                                message: "Changes saved",
                                user
                            })
                        }
                    }

                }
            } else if (blockchain == "sol") { // logged in with sol
                let user = User.findOne({ SOLAddress: address })
                if (!user) { // no username for logged in acct
                    return res.json({
                        success: "false",
                        message: "No corresponding Username for this address found"
                    })
                } else { // username found for logged in account with sol
                    if (SOLAddress != address.toUpperCase()) { // primary sol address changed )
                        let user = await User.findOne({ SOLAddress: SOLAddress })
                        if (user) { // new primary sol address is already taken
                            return res.json({
                                success: "false",
                                message: "Solana address is already associated with another Username"
                            })
                        } else { // new primary sol address is available
                            // now check if eth address is alrdy taken
                            console.log("there")
                            let user = await User.findOne({ ETHAddress })
                            if (user && user.SOLAddress !== address.toUpperCase() && ETHAddress) { // eth address is already taken by SOMEONE ELSE
                                return res.json({
                                    success: "false",
                                    message: "Ethereum address is already associated with another Username"
                                })
                            } else { // eth address is available
                                // eth addr is available + sol addr is available -- therefore make changes!
                                res.clearCookie("token") // NO RETURN here as need to make updates
                                console.log("user updated")
                                user = await User.findOneAndUpdate({ SOLAddress: address }, { SOLAddress, ETHAddress, BTCAddress, DESOAddress, bio, profilePic })
                                return res.json({
                                    success: "true",
                                    message: "Changes saved",
                                    user,
                                    loggedOut: "true"
                                })
                            }
                        }
                    } else { // primary sol address not changed
                        // check if eth address is alrdy taken
                        console.log("here")
                        let user = await User.findOne({ ETHAddress })
                        if (user && user.SOLAddress !== address.toUpperCase() && ETHAddress) { // eth address is already taken by SOMEONE ELSE
                            return res.json({
                                success: "false",
                                message: "Ethereum address is already associated with another Username"
                            })
                        } else { // eth address is available
                            // eth addr is available + sol addr is available -- therefore make changes!
                            console.log("user updated")
                            user = await User.findOneAndUpdate({ SOLAddress: address }, { SOLAddress, ETHAddress, BTCAddress, DESOAddress, bio, profilePic })
                            return res.json({
                                success: "true",
                                message: "Changes saved",
                                user
                            })
                        }
                    }
                }
            } else {
                res.json({
                    success: "false",
                    message: "Invalid blockchain"
                })
            }
        }
    })
})



app.post("/userDetails", (req: any, res: any) => {
    const { address, blockchain } = req.body
    if (blockchain === "eth") {
        User.findOne({ ETHAddress: address.toUpperCase() })
            .then((user: any) => {
                if (!user) {
                    return res.json({ success: false, message: "No User Found" })
                }
                res.send({ success: true, user })
            })
            .catch((err: any) => {
                res.status(500).send(err)
            })
    } else if (blockchain === "sol") {
        User.findOne({ SOLAddress: address.toUpperCase() })
            .then((user: any) => {
                if (!user) {
                    return res.json({ success: false, message: "No User Found" })
                }
                res.send({ success: true, user })
            })
            .catch((err: any) => {
                res.status(500).send(err)
            })
    } else {
        res.json({ success: false, message: "Invalid Blockchain" })
    }
})

app.get("/logout", async (req, res) => {
    res.clearCookie("token").json("logged out")
})

app.get("/isLoggedIn", async (req, res) => {
    const token = req.cookies.token
    jwt.verify(token, process.env.COOKIE_SECRET as string, async (err: any, decoded: any) => {
        if (err) {
            res.json({
                isLoggedIn: false
            })
        } else {
            res.json({
                isLoggedIn: true,
                address: decoded.data.address,
                blockchain: decoded.data.blockchain
            })
        }
    })
})

app.post("/promocode", async (req, res) => {
    const { promoCode } = req.body
    await PromoCode.build({ promoCode: promoCode }).save()
    res.send("Promo code added")
})


app.post("/login/sol", async (req, res) => {
    const { signedMessage, message, address, publicKey } = req.body
    const signature = signedMessage.signature
    const encodedMessage = new TextEncoder().encode(message);
    const web3PubKey: any = new web3.PublicKey(publicKey);
    const comparePbKey = JSON.stringify(web3PubKey._bn)

    const isValid = nacl.sign.detached.verify(encodedMessage, new Uint8Array(signature.data), new Uint8Array(address.data))

    console.log(comparePbKey.toUpperCase())
    console.log(signedMessage.publicKey._bn.toUpperCase())
    if (!isValid || signedMessage.publicKey._bn.toUpperCase() !== comparePbKey.toUpperCase()) {
        return res.json({
            success: false,
            message: "Login Failed"
        })
    }
    // generate jwt send it as response
    const token = jwt.sign({
        data: { address: publicKey.toUpperCase(), blockchain: "sol" }
    }, process.env.JWT_SECRET as string, {
        expiresIn: '2h'
    });

    // send jwt
    console.log("sending jwt", token)
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
    res.json({ success: true, message: "Logged in successfully" })
})



app.post("/login/eth", async (req, res) => {
    const { signature, message, address } = req.body


    const signer = await ethers.utils.verifyMessage(message, signature)
    console.log("signer", signer)
    if (signer.toUpperCase() !== address.toUpperCase()) {
        return res.json({ success: false, message: "Invalid signature" })
    }

    // generate jwt send it as response
    const token = jwt.sign({
        data: { address: signer.toUpperCase(), blockchain: "eth" }
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
    if (blockchain == "eth") {
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

    } else if (blockchain == "sol") {
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