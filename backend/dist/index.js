"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const ethers_1 = require("ethers");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("./models/User"));
const PromoCode_1 = __importDefault(require("./models/PromoCode"));
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const bitcoin_address_validation_1 = require("bitcoin-address-validation");
const web3 = __importStar(require("@solana/web3.js"));
const COINBASE_URL_ETH = "https://api.coinbase.com/v2/exchange-rates?currency=ETH";
const COINBASE_URL_SOL = "https://api.coinbase.com/v2/exchange-rates?currency=SOL";
const SOLANA_EXPLORER_URL = "https://api.mainnet-beta.solana.com/";
const SOLANA_ADDRESS = "wFQcfUuXkyb7puHS7mSbrjETEhnBDCfdbnLLDftKNLg";
const ETHEREUM_ADDRESS = "0X76AEB5092D8EABCEC324BE739B8BA5DF473F0055";
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'https://polychain.vercel.app',
        'https://polychain.tech',
        'https://www.polychain.tech'
    ],
    credentials: true
}));
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
function validSolAddress(s) {
    try {
        return new web3.PublicKey(s);
    }
    catch (e) {
        return null;
    }
}
app.get("/api/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // sanitize username
        if (req.params.username !== req.params.username.replace(/[^a-zA-Z0-9]/g, "")) {
            res.json({
                message: "Usernames can only contain letters and numbers. No spaces and special characters",
                success: false
            });
            return;
        }
        const user = yield User_1.default.findOne({ username: req.params.username }).exec();
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        else {
            return res.json({ success: true, user: user, message: "User found" });
        }
    }
    catch (e) {
        console.log(e);
        res.json({ success: false, message: "Something went wrong while serving your request" });
    }
}));
app.get("/api/address/eth/:address", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({ ETHAddress: req.params.address }).exec();
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        else {
            return res.json({ success: true, user: user, message: "User found" });
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ success: true, message: "Something went wrong while serving your request" });
    }
}));
app.get("/api/address/sol/:address", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({ SOLAddress: req.params.address }).exec();
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        else {
            return res.json({ success: true, user: user, message: "User found" });
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ success: true, message: "Something went wrong while serving your request" });
    }
}));
app.post("/userDetails/update", (req, res) => {
    try {
        // update details associated with the account that has the address in the cookie as having cookie means u have that address. 
        const token = req.cookies.token;
        jsonwebtoken_1.default.verify(token, process.env.COOKIE_SECRET, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) { // not logged in
                return res.json({
                    isNotLoggedIn: true,
                    success: false,
                    message: "Invalid token"
                });
            }
            else { // logged in
                let { address, blockchain } = decoded.data;
                address = address;
                let { ETHAddress, BTCAddress, DESOAddress, SOLAddress, bio, profilePic } = req.body;
                ETHAddress = ETHAddress && ETHAddress;
                BTCAddress = BTCAddress && BTCAddress;
                DESOAddress = DESOAddress && DESOAddress;
                SOLAddress = SOLAddress && SOLAddress;
                if (ETHAddress && !ethers_1.ethers.utils.isAddress(ETHAddress)) {
                    return res.json({
                        success: false,
                        message: "Invalid ETH address"
                    });
                }
                if (BTCAddress && !(0, bitcoin_address_validation_1.validate)(BTCAddress)) {
                    return res.json({
                        success: false,
                        message: "Invalid BTC address"
                    });
                }
                if (SOLAddress && !validSolAddress(SOLAddress)) {
                    return res.json({
                        success: false,
                        message: "Invalid SOL address"
                    });
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
                    });
                }
                if (blockchain == "eth") { // logged in with eth
                    let user = User_1.default.findOne({ ETHAddress: address }).exec();
                    if (!user) { // no username for logged in acct
                        return res.json({
                            success: false,
                            message: "No corresponding Username for this address found"
                        });
                    }
                    else { // username found for logged in account with eth
                        if (ETHAddress != address) { // primary eth address changed )
                            let user = yield User_1.default.findOne({ ETHAddress: ETHAddress }).exec();
                            if (user) { // new primary eth address is already taken
                                return res.json({
                                    success: false,
                                    message: "Ethereum address is already associated with another Username"
                                });
                            }
                            else { // new primary eth address is available
                                // now check if sol address is alrdy taken
                                let user = yield User_1.default.findOne({ SOLAddress }).exec();
                                if (user && user.ETHAddress !== address && SOLAddress) { // sol address is already taken by SOMEONE ELSE
                                    return res.json({
                                        success: false,
                                        message: "Solana address is already associated with another Username"
                                    });
                                }
                                else { // sol address is available
                                    // sol addr is available + eth addr is available -- therefore make changes!
                                    res.clearCookie("token"); // NO RETURN here as need to make updates
                                    user = yield User_1.default.findOneAndUpdate({ ETHAddress: address }, { ETHAddress, SOLAddress, BTCAddress, DESOAddress, bio, profilePic });
                                    return res.json({
                                        success: true,
                                        message: "Changes saved",
                                        user,
                                        loggedOut: true
                                    });
                                }
                            }
                        }
                        else { // primary eth address not changed
                            // check if sol address is alrdy taken
                            let user = yield User_1.default.findOne({ SOLAddress }).exec();
                            if (user && user.ETHAddress !== address && SOLAddress) { // sol address is already taken by SOMEONE ELSE
                                return res.json({
                                    success: false,
                                    message: "Solana address is already associated with another Username"
                                });
                            }
                            else { // sol address is available
                                // sol addr is available + eth addr is available -- therefore make changes!
                                user = yield User_1.default.findOneAndUpdate({ ETHAddress: address }, { ETHAddress, SOLAddress, BTCAddress, DESOAddress, bio, profilePic });
                                return res.json({
                                    success: true,
                                    message: "Changes saved",
                                    user
                                });
                            }
                        }
                    }
                }
                else if (blockchain == "sol") { // logged in with sol
                    let user = User_1.default.findOne({ SOLAddress: address }).exec();
                    if (!user) { // no username for logged in acct
                        return res.json({
                            success: false,
                            message: "No corresponding Username for this address found"
                        });
                    }
                    else { // username found for logged in account with sol
                        if (SOLAddress != address) { // primary sol address changed )
                            let user = yield User_1.default.findOne({ SOLAddress: SOLAddress }).exec();
                            if (user) { // new primary sol address is already taken
                                return res.json({
                                    success: false,
                                    message: "Solana address is already associated with another Username"
                                });
                            }
                            else { // new primary sol address is available
                                // now check if eth address is alrdy taken
                                let user = yield User_1.default.findOne({ ETHAddress }).exec();
                                if (user && user.SOLAddress !== address && ETHAddress) { // eth address is already taken by SOMEONE ELSE
                                    return res.json({
                                        success: false,
                                        message: "Ethereum address is already associated with another Username"
                                    });
                                }
                                else { // eth address is available
                                    // eth addr is available + sol addr is available -- therefore make changes!
                                    res.clearCookie("token"); // NO RETURN here as need to make updates
                                    user = yield User_1.default.findOneAndUpdate({ SOLAddress: address }, { SOLAddress, ETHAddress, BTCAddress, DESOAddress, bio, profilePic });
                                    return res.json({
                                        success: true,
                                        message: "Changes saved",
                                        user,
                                        loggedOut: true
                                    });
                                }
                            }
                        }
                        else { // primary sol address not changed
                            // check if eth address is alrdy taken
                            let user = yield User_1.default.findOne({ ETHAddress }).exec();
                            if (user && user.SOLAddress !== address && ETHAddress) { // eth address is already taken by SOMEONE ELSE
                                return res.json({
                                    success: false,
                                    message: "Ethereum address is already associated with another Username"
                                });
                            }
                            else { // eth address is available
                                // eth addr is available + sol addr is available -- therefore make changes!
                                user = yield User_1.default.findOneAndUpdate({ SOLAddress: address }, { SOLAddress, ETHAddress, BTCAddress, DESOAddress, bio, profilePic });
                                return res.json({
                                    success: true,
                                    message: "Changes saved",
                                    user
                                });
                            }
                        }
                    }
                }
                else {
                    res.json({
                        success: false,
                        message: "Invalid blockchain"
                    });
                }
            }
        }));
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
app.post("/userDetails", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        jsonwebtoken_1.default.verify(token, process.env.COOKIE_SECRET, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.json({
                    success: false,
                    message: "Not logged in",
                    isLoggedIn: false
                });
            }
            const { blockchain, address } = decoded.data;
            if (blockchain === "eth") {
                const user = yield User_1.default.findOne({ ETHAddress: address }).exec();
                if (!user) {
                    return res.json({ success: false, message: "No User Found", isLoggedIn: true });
                }
                res.json({ success: true, user, isLoggedIn: true });
            }
            else if (blockchain === "sol") {
                const user = yield User_1.default.findOne({ SOLAddress: address }).exec();
                if (!user) {
                    return res.json({ success: false, message: "No User Found", isLoggedIn: true });
                }
                res.json({ success: true, user, isLoggedIn: true });
            }
            else {
                res.json({ success: false, message: "Invalid Blockchain", isLoggedIn: true });
            }
        }));
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: "Server Error", isLoggedIn: false });
    }
}));
app.get("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("token").json("logged out");
    }
    catch (e) {
        console.log(e);
    }
}));
app.get("/isLoggedIn", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        jsonwebtoken_1.default.verify(token, process.env.COOKIE_SECRET, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                res.clearCookie("token");
                return res.json({
                    isLoggedIn: false
                });
            }
            else {
                res.json({
                    isLoggedIn: true,
                    address: decoded.data.address,
                    blockchain: decoded.data.blockchain
                });
            }
        }));
    }
    catch (e) {
        res.status(500).json({ success: false, message: "Server Error", isLoggedIn: false });
        console.log(e);
    }
}));
app.post("/promocode", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { promoCode } = req.body;
        yield PromoCode_1.default.build({ promoCode: promoCode }).save();
        res.send("Promo code added");
    }
    catch (e) {
        res.status(500).json({ success: false, message: "Server Error" });
        console.log(e);
    }
}));
app.post("/login/sol", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { signedMessage, message, address, publicKey } = req.body;
        const signature = signedMessage.signature;
        const encodedMessage = new TextEncoder().encode(message);
        const web3PubKey = new web3.PublicKey(publicKey);
        const comparePbKey = JSON.parse(JSON.stringify(web3PubKey._bn));
        const isValid = tweetnacl_1.default.sign.detached.verify(encodedMessage, new Uint8Array(signature.data), new Uint8Array(address.data));
        if (!isValid || signedMessage.publicKey._bn !== comparePbKey) {
            return res.json({
                success: false,
                message: "Login Failed"
            });
        }
        // generate jwt send it as response
        const token = jsonwebtoken_1.default.sign({
            data: { address: publicKey, blockchain: "sol" }
        }, process.env.JWT_SECRET, {
            expiresIn: '2h'
        });
        // send jwt
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
        res.json({ success: true, message: "Logged in successfully", address: publicKey });
    }
    catch (e) {
        res.status(500).json({ success: false, message: "Server Error" });
        console.log(e);
    }
}));
app.post("/login/eth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { signature, message, address } = req.body;
        const signer = ethers_1.ethers.utils.verifyMessage(message, signature);
        if (signer.toUpperCase() !== address.toUpperCase()) {
            return res.json({ success: false, message: "Invalid signature" });
        }
        // generate jwt send it as response
        const token = jsonwebtoken_1.default.sign({
            data: { address: signer, blockchain: "eth" }
        }, process.env.JWT_SECRET, {
            expiresIn: '2h'
        });
        // send jwt
        res.cookie("token", token, { httpOnly: true, secure: true });
        res.json({ success: true, message: "Logged in successfully", address: signer });
    }
    catch (e) {
        res.status(500).json({ success: false, message: "Server Error" });
        console.log(e);
    }
}));
app.post("/register/promo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        // no need to add token as token already there
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                res.json({
                    success: false,
                    message: "You have to login first",
                    isNotLoggedIn: true
                });
            }
            else {
                const { address, blockchain } = decoded.data;
                const { promoCode, username } = req.body;
                if (promoCode !== promoCode.replace(/[^a-zA-Z0-9]/g, "")) {
                    res.json({
                        message: "Invalid Promocode",
                        success: false
                    });
                    return;
                }
                if (username !== username.replace(/[^a-zA-Z0-9]/g, "")) {
                    res.json({
                        message: "Usernames can only contain letters and numbers. No spaces and special characters",
                        success: false
                    });
                    return;
                }
                if (username.length < 1) {
                    return res.json({
                        success: false,
                        message: "Username is too short"
                    });
                }
                // check if promo code is valid (not used and exists)
                let existingCode = yield PromoCode_1.default.findOne({ promoCode, address: "" }).exec();
                if (!existingCode) {
                    return res.json({
                        success: false,
                        message: "Invalid promo code"
                    });
                }
                // check if username available in DB
                let existingUser = yield User_1.default.findOne({ username }).exec();
                if (existingUser) {
                    return res.json({
                        success: false,
                        message: "Username already taken"
                    });
                }
                // check if address not already used
                if (blockchain == "eth") {
                    existingUser = yield User_1.default.findOne({ ETHAddress: address }).exec();
                    if (existingUser) {
                        return res.json({
                            success: false,
                            message: "The address with which you are trying to buy the username is already linked with another account. Try again with another wallet."
                        });
                    }
                    // add user
                    const user = yield User_1.default.build({
                        username,
                        ETHAddress: address
                    });
                    existingCode.address = address;
                    existingCode.blockchain = "eth";
                    existingCode.save();
                    user.save();
                    // generate jwt
                    return res.json({
                        success: true,
                        message: "Registration Successful",
                        address: address,
                        blockchain: blockchain,
                        user
                    });
                }
                else if (blockchain == "sol") {
                    existingUser = yield User_1.default.findOne({ SOLAddress: address }).exec();
                    if (existingUser) {
                        return res.json({
                            success: false,
                            message: "The address with which you are trying to buy the username is already linked with another account. Try again with another wallet."
                        });
                    }
                    // add user
                    const user = yield User_1.default.build({
                        username,
                        SOLAddress: address
                    });
                    existingCode.address = address;
                    existingCode.blockchain = "sol";
                    existingCode.save();
                    user.save();
                    return res.json({
                        success: true,
                        message: "Registration sucessful!",
                        address: address,
                        blockchain: blockchain,
                        user
                    });
                }
                else {
                    return res.json({
                        success: false,
                        message: "Invalid blockchain"
                    });
                }
            }
        }));
    }
    catch (e) {
        res.status(500).json({ success: false, message: "Server Error" });
        console.log(e);
    }
}));
app.post("/register/sol", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // address for username taken from transaction payer NOT JWT. THIS IS INTENTIONAL. 
        const { hash, username } = req.body;
        if (username !== username.replace(/[^a-zA-Z0-9]/g, "")) {
            res.json({
                message: "Usernames can only contain letters and numbers. No spaces and special characters",
                success: false
            });
            return;
        }
        if (username.length < 1) {
            return res.json({
                success: false,
                message: "Username is too short"
            });
        }
        // check if username available in DB and check if same address not already used to create some other username
        let existingUser = yield User_1.default.findOne({ username }).exec();
        if (existingUser) {
            return res.json({
                success: false,
                message: "Username already taken"
            });
        }
        // check coinbase rate
        const coinbaseResponse = yield axios_1.default.get(COINBASE_URL_SOL);
        const USDPerSOL = coinbaseResponse.data.data.rates.USD;
        const solanaExplorerResponse = yield axios_1.default.post(SOLANA_EXPLORER_URL, {
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
        });
        if (!solanaExplorerResponse.data) {
            return res.json({
                success: false,
                message: "Transaction not found on Solana Explorer"
            });
        }
        const from = solanaExplorerResponse.data.result.transaction.message.accountKeys[0];
        const to = solanaExplorerResponse.data.result.transaction.message.accountKeys[1];
        const fee = solanaExplorerResponse.data.result.meta.fee;
        const preBalanceSender = solanaExplorerResponse.data.result.meta.preBalances[0];
        const postBalanceSender = solanaExplorerResponse.data.result.meta.postBalances[0];
        const solPaid = (preBalanceSender - postBalanceSender - fee) / (10 ** 9);
        const solPaidUSD = solPaid * USDPerSOL;
        // verify that amount paid to right address
        if (to.toUpperCase() !== SOLANA_ADDRESS.toUpperCase()) {
            return res.json({
                success: false,
                message: "USD paid to wrong address"
            });
        }
        // check if appropriate amount paid in eth
        if (solPaidUSD < 4.8) {
            return res.json({
                success: false,
                message: "Not enough USD paid"
            });
        }
        // check if address already used
        existingUser = yield User_1.default.findOne({ SOLAddress: from }).exec();
        if (existingUser) {
            return res.json({
                success: false,
                message: "The address with which you are trying to buy the username is already linked with another account. Try again with another wallet."
            });
        }
        // if yes, then assign username in mongodb, otherwise reject
        const newuser = User_1.default.build({
            username,
            SOLAddress: from
        });
        yield newuser.save();
        const token = jsonwebtoken_1.default.sign({
            data: { address: from, blockchain: "sol" }
        }, process.env.JWT_SECRET, {
            expiresIn: '2h'
        });
        // send jwt
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
        return res.json({ success: true, message: "Registration successful!", address: from });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}));
app.post("/register/eth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // transaction data coming succesfully in req.body!
        const { tx, username } = req.body;
        if (username !== username.replace(/[^a-zA-Z0-9]/g, "")) {
            res.json({
                message: "Usernames can only contain letters and numbers. No spaces and special characters",
                success: false
            });
            return;
        }
        if (username.length < 1) {
            return res.json({
                success: false,
                message: "Username is too short"
            });
        }
        // check if username available in DB
        let existingUser = yield User_1.default.findOne({ username }).exec();
        if (existingUser) {
            return res.json({
                success: false,
                message: "Username already taken"
            });
        }
        // check coinbase rate
        const coinbaseResponse = yield axios_1.default.get(COINBASE_URL_ETH);
        const USDPerETH = coinbaseResponse.data.data.rates.USD;
        // check whether transaction hash is there on etherscan and check the amount paid
        const etherscanResponse = yield axios_1.default.get(`https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${tx.hash}&apikey=${process.env.ETHERSCAN_API_KEY}`);
        const txDetailsFromEtherscan = etherscanResponse.data.result;
        if (!txDetailsFromEtherscan) {
            return res.json({
                success: false,
                message: "Transaction not found on etherscan"
            });
        }
        const ethPaid = parseInt(txDetailsFromEtherscan.value, 16) / 10 ** 18;
        const ethPaidUSD = ethPaid * USDPerETH;
        // verify that amount paid to right address
        if (txDetailsFromEtherscan.toUpperCae() !== ETHEREUM_ADDRESS.toUpperCase()) {
            return res.json({
                success: false,
                message: "USD paid to wrong address"
            });
        }
        // check if appropriate amount paid in eth
        if (ethPaidUSD < 4.8) {
            return res.json({
                success: false,
                message: "Not enough USD paid"
            });
        }
        // check if address not already used
        existingUser = yield User_1.default.findOne({ ETHAddress: txDetailsFromEtherscan.from }).exec();
        if (existingUser) {
            return res.json({
                success: false,
                message: "The address with which you are trying to buy the username is already linked with another account. Try again with another wallet."
            });
        }
        // if yes, then assign username in mongodb, otherwise reject
        const newuser = User_1.default.build({
            username,
            ETHAddress: txDetailsFromEtherscan.from
        });
        yield newuser.save();
        const token = jsonwebtoken_1.default.sign({
            data: { address: txDetailsFromEtherscan.from, blockchain: "eth" }
        }, process.env.JWT_SECRET, {
            expiresIn: '2h'
        });
        // send jwt
        // TODO: fix this cookie bit
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
        return res.json({ success: true, message: "Registration successful!", address: txDetailsFromEtherscan.from });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}));
// configure mongodb connection
try {
    mongoose_1.default.connect(process.env.MONGO_URI, {}, (e) => {
        if (e) {
            console.log(e);
        }
        console.log("connected to mongodb");
        app.listen(3001, () => {
            console.log('listening on port 3001');
        });
    });
}
catch (err) {
    console.log("could not connect to mongodb and app uninitialized");
    console.log(err);
}
