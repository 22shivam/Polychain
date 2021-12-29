const express = require("express")
const cors = require("cors")
const axios = require('axios');
require('dotenv').config()

const app = express()

const COINBASE_URL_ETH = "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
const COINBASE_URL_SOL = "https://api.coinbase.com/v2/exchange-rates?currency=SOL"
const SOLANA_EXPLORER_URL = process.env.SOLANA_EXPLORER_URL

app.use(
    express.urlencoded({
        extended: false
    })
)
app.use(express.json())
app.use(cors())


app.post("/register/sol", async (req, res) => {
    console.log("req rcvd")
    console.log(req.body)
    const { hash, username } = req.body
    // check if username available in DB and check if same address not already used to create some other username

    // check coinbase rate
    const coinbaseResponse = await axios.get(COINBASE_URL_SOL)
    const USDPerSOL = coinbaseResponse.data.data.rates.USD
    console.log(USDPerSOL)
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

    const to = solanaExplorerResponse.data.result.transaction.message.accountKeys[1]
    const fee = solanaExplorerResponse.data.result.meta.fee
    const preBalanceSender = solanaExplorerResponse.data.result.meta.preBalances[0]
    const postBalanceSender = solanaExplorerResponse.data.result.meta.postBalances[0]

    const solPaid = (preBalanceSender - postBalanceSender - fee) / (10 ** 9)
    const solPaidUSD = solPaid * USDPerSOL
    console.log(solPaidUSD)

    // verify that amount paid to right address
    console.log(to)
    if (totoUpperCase() !== "AA6bqLgTzYPpFFH2R9XLdudibWcemLkKDRtZmPQEsEiS") {
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

    // if yes, then assign username in mongodb, otherwise reject

    return res.json(req.body)




    res.json(req.body)
})


app.post("/register/eth", async (req, res) => {
    // transaction data coming succesfully in req.body!
    const { tx, username } = req.body

    // check if username available in DB and check if same address not already used to create some other username

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

    // if yes, then assign username in mongodb, otherwise reject

    return res.json(req.body)



})


app.listen(3001, () => {
    console.log('listening on port 3001')
})