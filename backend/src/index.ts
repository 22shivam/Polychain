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
import { validate } from "bitcoin-address-validation"
import * as web3 from '@solana/web3.js'
import fetchTweet from "./utils/getTweet";
import PolychainDrop from "./models/PolychainDrop";

const COINBASE_URL_ETH = "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
const COINBASE_URL_SOL = "https://api.coinbase.com/v2/exchange-rates?currency=SOL"
const SOLANA_EXPLORER_URL: string = "https://api.mainnet-beta.solana.com/"
const SOLANA_ADDRESS = "wFQcfUuXkyb7puHS7mSbrjETEhnBDCfdbnLLDftKNLg"
const ETHEREUM_ADDRESS = "0X76AEB5092D8EABCEC324BE739B8BA5DF473F0055"

dotenv.config()
const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://polychain.vercel.app',
        'https://polychain.tech',
        'https://www.polychain.tech',
        "https://polychain-8igkmtn8f-22shivam.vercel.app",
        "https://spindl.me",
        'https://www.spindl.me',
    ],
    credentials: true
}))
app.use(cookieParser(process.env.COOKIE_SECRET))

function validSolAddress(s: any) {
    try {
        return new web3.PublicKey(s);
    } catch (e) {
        return null;

    }
}

app.post('/api/tweet', async (req, res) => {
    try {
        const { tweetURL } = req.body
        const info = await fetchTweet(tweetURL);
        res.json({ data: info, success: true });
    } catch (e) {
        res.json({
            success: false
        })
    }
});


app.get("/api/:username", async (req, res) => {
    try {
        // sanitize username
        if (req.params.username !== req.params.username.replace(/[^a-zA-Z0-9]/g, "")) {
            res.json({
                message: "Usernames can only contain letters and numbers. No spaces and special characters",
                success: false
            })
            return
        }

        const user = await User.findOne({ username: req.params.username }).exec()
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        } else {
            if (user.totalVisits) {
                user.totalVisits += 1;
            } else {
                user.totalVisits = 1;
            }
            user.save()
            return res.json({ success: true, user: user, message: "User found" })
        }
    } catch (e) {
        console.log(e)
        res.json({ success: false, message: "Something went wrong while serving your request" })
    }
})

app.get("/api/address/eth/:address", async (req, res) => {
    try {
        const user = await User.findOne({ ETHAddress: req.params.address }).exec()
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        } else {
            return res.json({ success: true, user: user, message: "User found" })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({ success: true, message: "Something went wrong while serving your request" })
    }
})

app.get("/api/address/sol/:address", async (req, res) => {
    try {
        const user = await User.findOne({ SOLAddress: req.params.address }).exec()
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        } else {
            return res.json({ success: true, user: user, message: "User found" })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({ success: true, message: "Something went wrong while serving your request" })
    }
})


app.post("/userDetails/minttoken", (req: any, res: any) => {
    try {

        const token = req.cookies.token
        jwt.verify(token, process.env.COOKIE_SECRET as string, async (err: any, decoded: any) => {
            if (err) { // not logged in
                return res.json({
                    isNotLoggedIn: true,
                    success: false,
                    message: "Invalid token"
                })
            } else { // logged in
                let { address, blockchain } = decoded.data
                if (blockchain !== "eth") {
                    return res.json({
                        success: false,
                        message: "We currently only support token minting with Ethereum"
                    })
                }
                let { tokenName, tokenSymbol, tokenSupply, contractAddress } = req.body
                console.log(tokenName, tokenSupply, tokenSymbol, contractAddress)
                if (tokenSupply && tokenSupply <= 0) {
                    return res.json({
                        success: false,
                        message: "Token supply must be greater than 0"
                    })
                }
                if (!tokenName || !tokenSymbol || !contractAddress) {
                    return res.json({
                        success: false,
                        message: "Please provide all the required information"
                    })
                }
                const user = await User.findOne({ ETHAddress: address }).exec()
                if (!user) {
                    return res.json({
                        success: false,
                        message: "No user found with this Ethereum address"
                    })
                }
                user.personalToken = {
                    tokenName: tokenName,
                    tokenSymbol: tokenSymbol,
                    tokenSupply: tokenSupply,
                    tokenAddress: contractAddress,
                    tokenOwner: address,
                    tokenBlockchain: blockchain
                }
                await user.save()
                return res.json({
                    success: true,
                    message: "Token minted successfully"
                })
            }
        })

    } catch (e) {
        console.log(e)
        res.status(500).json({ success: false, message: "Something went wrong while serving your request" })
    }
})


app.post("/userDetails/update", (req: any, res: any) => {
    try {
        // update details associated with the account that has the address in the cookie as having cookie means u have that address. 
        const token = req.cookies.token
        jwt.verify(token, process.env.COOKIE_SECRET as string, async (err: any, decoded: any) => {
            if (err) { // not logged in
                return res.json({
                    isNotLoggedIn: true,
                    success: false,
                    message: "Invalid token"
                })
            } else { // logged in
                let { address, blockchain } = decoded.data
                address = address
                let { ETHAddress, BTCAddress, DESOAddress, SOLAddress, bio, profilePic, twitterUsername, githubUsername, facebookUsername, instagramUsername, tiktokUsername, youtubeUsername, linkedinUsername, pinterestUsername, redditUsername, snapchatUsername, fullName, links } = req.body
                ETHAddress = ETHAddress && ETHAddress
                BTCAddress = BTCAddress && BTCAddress
                DESOAddress = DESOAddress && DESOAddress
                SOLAddress = SOLAddress && SOLAddress

                if (ETHAddress && !ethers.utils.isAddress(ETHAddress)) {
                    return res.json({
                        success: false,
                        message: "Invalid ETH address"
                    })
                }
                if (BTCAddress && !validate(BTCAddress)) {
                    return res.json({
                        success: false,
                        message: "Invalid BTC address"
                    })
                }

                if (SOLAddress && !validSolAddress(SOLAddress)) {
                    return res.json({
                        success: false,
                        message: "Invalid SOL address"
                    })
                }
                // if (DESOAddress && !validate(DESOAddress)) {
                //     return res.json({
                //         success: false,
                //         message: "Invalid DESO address"
                //     })
                // }

                if (bio && bio.length > 160) {
                    return res.json({
                        success: false,
                        message: "Bio must be less than 160 characters"
                    })
                }


                if (blockchain == "eth") { // logged in with eth
                    let user = User.findOne({ ETHAddress: address }).exec()
                    if (!user) { // no username for logged in acct
                        return res.json({
                            success: false,
                            message: "No corresponding Username for this address found"
                        })
                    } else { // username found for logged in account with eth

                        if (ETHAddress != address) { // primary eth address changed )
                            let user = await User.findOne({ ETHAddress: ETHAddress }).exec()
                            if (user) { // new primary eth address is already taken
                                return res.json({
                                    success: false,
                                    message: "Ethereum address is already associated with another Username"
                                })
                            } else { // new primary eth address is available
                                // now check if sol address is alrdy taken
                                let user = await User.findOne({ SOLAddress }).exec()
                                if (user && user.ETHAddress !== address && SOLAddress) { // sol address is already taken by SOMEONE ELSE
                                    return res.json({
                                        success: false,
                                        message: "Solana address is already associated with another Username"
                                    })
                                } else { // sol address is available
                                    // sol addr is available + eth addr is available -- therefore make changes!
                                    res.clearCookie("token") // NO RETURN here as need to make updates
                                    user = await User.findOneAndUpdate({ ETHAddress: address }, { links, ETHAddress, SOLAddress, BTCAddress, DESOAddress, bio, profilePic, twitterUsername, githubUsername, facebookUsername, instagramUsername, tiktokUsername, youtubeUsername, linkedinUsername, pinterestUsername, redditUsername, snapchatUsername, fullName })
                                    return res.json({
                                        success: true,
                                        message: "Changes saved",
                                        user,
                                        loggedOut: true
                                    })
                                }


                            }

                        } else { // primary eth address not changed
                            // check if sol address is alrdy taken
                            let user = await User.findOne({ SOLAddress }).exec()
                            if (user && user.ETHAddress !== address && SOLAddress) { // sol address is already taken by SOMEONE ELSE
                                return res.json({
                                    success: false,
                                    message: "Solana address is already associated with another Username"
                                })
                            } else { // sol address is available
                                // sol addr is available + eth addr is available -- therefore make changes!

                                user = await User.findOneAndUpdate({ ETHAddress: address }, { links, ETHAddress, SOLAddress, BTCAddress, DESOAddress, bio, profilePic, twitterUsername, githubUsername, facebookUsername, instagramUsername, tiktokUsername, youtubeUsername, linkedinUsername, pinterestUsername, redditUsername, snapchatUsername, fullName })
                                return res.json({
                                    success: true,
                                    message: "Changes saved",
                                    user
                                })
                            }
                        }

                    }
                } else if (blockchain == "sol") { // logged in with sol
                    let user = User.findOne({ SOLAddress: address }).exec()
                    if (!user) { // no username for logged in acct
                        return res.json({
                            success: false,
                            message: "No corresponding Username for this address found"
                        })
                    } else { // username found for logged in account with sol
                        if (SOLAddress != address) { // primary sol address changed )
                            let user = await User.findOne({ SOLAddress: SOLAddress }).exec()
                            if (user) { // new primary sol address is already taken
                                return res.json({
                                    success: false,
                                    message: "Solana address is already associated with another Username"
                                })
                            } else { // new primary sol address is available
                                // now check if eth address is alrdy taken
                                let user = await User.findOne({ ETHAddress }).exec()
                                if (user && user.SOLAddress !== address && ETHAddress) { // eth address is already taken by SOMEONE ELSE
                                    return res.json({
                                        success: false,
                                        message: "Ethereum address is already associated with another Username"
                                    })
                                } else { // eth address is available
                                    // eth addr is available + sol addr is available -- therefore make changes!
                                    res.clearCookie("token") // NO RETURN here as need to make updates

                                    user = await User.findOneAndUpdate({ SOLAddress: address }, { links, SOLAddress, ETHAddress, BTCAddress, DESOAddress, bio, profilePic, twitterUsername, githubUsername, facebookUsername, instagramUsername, tiktokUsername, youtubeUsername, linkedinUsername, pinterestUsername, redditUsername, snapchatUsername, fullName })
                                    return res.json({
                                        success: true,
                                        message: "Changes saved",
                                        user,
                                        loggedOut: true
                                    })
                                }
                            }
                        } else { // primary sol address not changed
                            // check if eth address is alrdy taken
                            let user = await User.findOne({ ETHAddress }).exec()
                            if (user && user.SOLAddress !== address && ETHAddress) { // eth address is already taken by SOMEONE ELSE
                                return res.json({
                                    success: false,
                                    message: "Ethereum address is already associated with another Username"
                                })
                            } else { // eth address is available
                                // eth addr is available + sol addr is available -- therefore make changes!

                                user = await User.findOneAndUpdate({ SOLAddress: address }, { links, SOLAddress, ETHAddress, BTCAddress, DESOAddress, bio, profilePic, twitterUsername, githubUsername, facebookUsername, instagramUsername, tiktokUsername, youtubeUsername, linkedinUsername, pinterestUsername, redditUsername, snapchatUsername, fullName })
                                return res.json({
                                    success: true,
                                    message: "Changes saved",
                                    user
                                })
                            }
                        }
                    }
                } else {
                    res.json({
                        success: false,
                        message: "Invalid blockchain"
                    })
                }
            }
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({ success: false, message: "Server error" })
    }
})



app.post("/userDetails", async (req: any, res: any) => {
    try {
        const token = req.cookies.token
        jwt.verify(token, process.env.COOKIE_SECRET as string, async (err: any, decoded: any) => {
            if (err) {
                return res.json({
                    success: false,
                    message: "Not logged in",
                    isLoggedIn: false
                })
            }
            const { blockchain, address } = decoded.data
            if (blockchain === "eth") {
                const user = await User.findOne({ ETHAddress: address }).exec()
                if (!user) {
                    return res.json({ success: false, message: "No User Found", isLoggedIn: true })
                }
                // const resp = await axios.get(`https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`);

                res.json({ success: true, user, isLoggedIn: true }) //  ethereumTransactions: resp.data.result
            } else if (blockchain === "sol") {
                const user = await User.findOne({ SOLAddress: address }).exec()
                if (!user) {
                    return res.json({ success: false, message: "No User Found", isLoggedIn: true })
                }
                res.json({ success: true, user, isLoggedIn: true })
            } else {
                res.json({ success: false, message: "Invalid Blockchain", isLoggedIn: true })
            }
        })
    } catch (e) {
        console.log(e)
        res.status(500).json({ success: false, message: "Server Error", isLoggedIn: false })
    }
})



app.get("/logout", async (req, res) => {
    try {
        res.clearCookie("token").json("logged out")
    } catch (e) {
        console.log(e)
    }
})

// app.get("addUserToDrop/:address", async (req, res) => {
//     try {
//         const { address } = req.params

//         if (!user) {
//             return res.json({ success: false, message: "No User Found" })
//         }
//         const drop = await Drop.findOne({ SOLAddress: address }).exec()
//         if (!drop) {
//             return res.json({ success: false, message: "No Drop Found" })
//         }
//         drop.users.push(user)
//         await drop.save()
//         return res.json({ success: true, message: "User added to drop" })
//     } catch (e) {
//         console.log(e)
//         res.status(500).json({ success: false, message: "Server Error" })
//     }
// }))

app.get("/isLoggedIn", async (req, res) => {
    try {
        const token = req.cookies.token

        jwt.verify(token, process.env.COOKIE_SECRET as string, async (err: any, decoded: any) => {
            if (err) {
                res.clearCookie("token")
                return res.json({
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
    } catch (e) {
        res.status(500).json({ success: false, message: "Server Error", isLoggedIn: false })
        console.log(e)
    }
})

app.get("/polychainDrop", async (req, res) => {
    try {
        const token = req.cookies.token
        jwt.verify(token, process.env.COOKIE_SECRET as string, async (err: any, decoded: any) => {
            if (err) {
                return res.json({
                    success: false,
                    message: "Not logged in",
                    isLoggedIn: false
                })
            }
            const { blockchain, address } = decoded.data
            if (blockchain !== "eth") {
                return res.json({
                    success: false,
                    message: "You need to be logged in with an Ethereum Wallet in order to access the drop",
                })
            }

            const user = await PolychainDrop.findOne({ address: address }).exec()
            if (!user) {
                return res.json({
                    success: false,
                    message: "You are not eligible for the drop",
                })
            }
            return res.json({
                success: true,
                message: "You are eligible for the drop",
                user
            })
        })

    } catch (e) {
        console.log(e)
        res.status(500).json({ success: false, message: "Server Error" })

    }
})

// app.post("/promocode", async (req, res) => {
//     try {
//         for (let i = 0; i < 101; i++) {
//             let promoCode = Math.random().toString(36).slice(6);
//             console.log(promoCode)
//             await PromoCode.build({ promoCode: promoCode }).save()
//         }
//         return res.send("Promo cods added")
//     } catch (e) {
//         res.status(500).json({ success: false, message: "Server Error" })
//         return console.log(e)
//     }
// })


app.post("/login/sol", async (req, res) => {
    try {
        const { signedMessage, message, address, publicKey } = req.body
        const signature = signedMessage.signature
        const encodedMessage = new TextEncoder().encode(message);
        const web3PubKey: any = new web3.PublicKey(publicKey);
        const comparePbKey = JSON.parse(JSON.stringify(web3PubKey._bn))

        const isValid = nacl.sign.detached.verify(encodedMessage, new Uint8Array(signature.data), new Uint8Array(address.data))

        if (!isValid || signedMessage.publicKey._bn !== comparePbKey) {
            return res.json({
                success: false,
                message: "Login Failed"
            })
        }
        // generate jwt send it as response
        const token = jwt.sign({
            data: { address: publicKey, blockchain: "sol" }
        }, process.env.JWT_SECRET as string, {
            expiresIn: '2h'
        });

        // send jwt
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
        res.json({ success: true, message: "Logged in successfully", address: publicKey })
    } catch (e) {
        res.status(500).json({ success: false, message: "Server Error" })
        console.log(e)
    }
})



app.post("/login/eth", async (req, res) => {
    try {
        const { signature, message, address } = req.body

        const signer = ethers.utils.verifyMessage(message, signature)
        if (signer.toUpperCase() !== address.toUpperCase()) {
            return res.json({ success: false, message: "Invalid signature" })
        }

        // generate jwt send it as response
        const token = jwt.sign({
            data: { address: signer, blockchain: "eth" }
        }, process.env.JWT_SECRET as string, {
            expiresIn: '2h'
        });

        // send jwt
        res.cookie("token", token, { httpOnly: true, secure: true })
        res.json({ success: true, message: "Logged in successfully", address: signer })
    } catch (e) {
        res.status(500).json({ success: false, message: "Server Error" })
        console.log(e)
    }
})

app.post("/register/promo", async (req, res) => {
    try {
        const token = req.cookies.token
        // no need to add token as token already there

        jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, decoded: any) => {
            if (err) {
                res.json({
                    success: false,
                    message: "You have to login first",
                    isNotLoggedIn: true
                })
            } else {
                const { address, blockchain } = decoded.data
                const { promoCode, username } = req.body

                if (promoCode !== promoCode.replace(/[^a-zA-Z0-9]/g, "")) {
                    res.json({
                        message: "Invalid Promocode",
                        success: false
                    })
                    return
                }

                if (username !== username.replace(/[^a-zA-Z0-9]/g, "")) {
                    res.json({
                        message: "Usernames can only contain letters and numbers. No spaces and special characters",
                        success: false
                    })
                    return
                }

                if (username.length < 1) {
                    return res.json({
                        success: false,
                        message: "Username is too short"
                    })
                }

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

                if (blockchain == "eth") {
                    existingUser = await User.findOne({ ETHAddress: address }).exec()
                    if (existingUser) {
                        return res.json({
                            success: false,
                            message: "The address with which you are trying to buy the username is already linked with another account. Try again with another wallet."
                        })
                    }

                    // add user
                    const user = await User.build({
                        username,
                        ETHAddress: address
                    })
                    existingCode.address = address
                    existingCode.blockchain = "eth"
                    existingCode.save()
                    user.save()


                    // generate jwt

                    return res.json({
                        success: true,
                        message: "Registration Successful",
                        address: address,
                        blockchain: blockchain,
                        user
                    })

                } else if (blockchain == "sol") {
                    existingUser = await User.findOne({ SOLAddress: address }).exec()
                    if (existingUser) {
                        return res.json({
                            success: false,
                            message: "The address with which you are trying to buy the username is already linked with another account. Try again with another wallet."
                        })
                    }

                    // add user
                    const user = await User.build({
                        username,
                        SOLAddress: address
                    })
                    existingCode.address = address
                    existingCode.blockchain = "sol"
                    existingCode.save()
                    user.save()


                    return res.json({
                        success: true,
                        message: "Registration sucessful!",
                        address: address,
                        blockchain: blockchain,
                        user
                    })

                } else {
                    return res.json({
                        success: false,
                        message: "Invalid blockchain"
                    })
                }
            }
        })
    } catch (e) {
        res.status(500).json({ success: false, message: "Server Error" })
        console.log(e)
    }
})


app.post("/register/sol", async (req, res) => {
    try {
        // address for username taken from transaction payer NOT JWT. THIS IS INTENTIONAL. 

        const { hash, username } = req.body

        if (username !== username.replace(/[^a-zA-Z0-9]/g, "")) {
            res.json({
                message: "Usernames can only contain letters and numbers. No spaces and special characters",
                success: false
            })
            return
        }

        if (username.length < 1) {
            return res.json({
                success: false,
                message: "Username is too short"
            })
        }
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
                success: false,
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


        // verify that amount paid to right address

        if (to.toUpperCase() !== SOLANA_ADDRESS.toUpperCase()) {
            return res.json({
                success: false,
                message: "USD paid to wrong address"
            })
        }

        // check if appropriate amount paid in eth
        if (solPaidUSD < 4.8) {
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
                message: "The address with which you are trying to buy the username is already linked with another account. Try again with another wallet."
            })
        }

        // if yes, then assign username in mongodb, otherwise reject
        const newuser = User.build({
            username,
            SOLAddress: from
        })
        await newuser.save()
        const token = jwt.sign({
            data: { address: from, blockchain: "sol" }
        }, process.env.JWT_SECRET as string, {
            expiresIn: '2h'
        });

        // send jwt
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" })

        return res.json({ success: true, message: "Registration successful!", address: from })
    } catch (e) {
        console.log(e)
        res.status(500).json({ success: false, message: "Server Error" })
    }
})


app.post("/register/eth", async (req, res) => {
    try {
        // transaction data coming succesfully in req.body!
        const { tx, username, polygon } = req.body

        if (username !== username.replace(/[^a-zA-Z0-9]/g, "")) {
            res.json({
                message: "Usernames can only contain letters and numbers. No spaces and special characters",
                success: false
            })
            return
        }

        if (username.length < 1) {
            return res.json({
                success: false,
                message: "Username is too short"
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

        // check coinbase rate
        const coinbaseResponse = await axios.get(COINBASE_URL_ETH)
        const USDPerETH = coinbaseResponse.data.data.rates.USD

        // check whether transaction hash is there on etherscan and check the amount paid
        let url = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${tx.hash}&apikey=${process.env.ETHERSCAN_API_KEY}`
        if (polygon) {
            url = `https://api.polygonscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${tx.hash}&apikey=${process.env.POLYGONSCAN_API_KEY}`
        }

        const etherscanResponse = await axios.get(url)
        const txDetailsFromEtherscan = etherscanResponse.data.result

        if (!txDetailsFromEtherscan) {
            return res.json({
                success: false,
                message: "Transaction not found on etherscan"
            })
        }
        const ethPaid = parseInt(txDetailsFromEtherscan.value, 16) / 10 ** 18
        const ethPaidUSD = ethPaid * USDPerETH

        // verify that amount paid to right address
        if (txDetailsFromEtherscan.to.toUpperCase() !== ETHEREUM_ADDRESS.toUpperCase()) {
            return res.json({
                success: false,
                message: "USD paid to wrong address"
            })
        }

        // check if appropriate amount paid in eth
        if (ethPaidUSD < 4.8) {
            return res.json({
                success: false,
                message: "Not enough USD paid"
            })
        }

        // check if address not already used
        existingUser = await User.findOne({ ETHAddress: txDetailsFromEtherscan.from }).exec()
        if (existingUser) {
            return res.json({
                success: false,
                message: "The address with which you are trying to buy the username is already linked with another account. Try again with another wallet."
            })
        }

        // if yes, then assign username in mongodb, otherwise reject
        const newuser = User.build({
            username,
            ETHAddress: txDetailsFromEtherscan.from
        })
        await newuser.save()

        const token = jwt.sign({
            data: { address: txDetailsFromEtherscan.from, blockchain: "eth" }
        }, process.env.JWT_SECRET as string, {
            expiresIn: '2h'
        });

        // send jwt
        // TODO: fix this cookie bit
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" })

        return res.json({ success: true, message: "Registration successful!", address: txDetailsFromEtherscan.from })
    } catch (e) {
        console.log(e)
        res.status(500).json({ success: false, message: "Server Error" })
    }
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
    console.log(err)
}

