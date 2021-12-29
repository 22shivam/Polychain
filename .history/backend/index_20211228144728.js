const express = require("express")
const cors = require("cors")
const axios = require('axios');
require('dotenv').config()

const app = express()

const COINBASE_URL = "https://api.coinbase.com/v2/exchange-rates"

app.use(
    express.urlencoded({
        extended: false
    })
)
app.use(express.json())
app.use(cors())


app.post("/register/eth", async (req, res) => {
    // transaction data coming succesfully in req.body!
    const { tx, username } = req.body

    // check if username available in DB

    // check coinbase rate
    const coinbaseResponse = await axios.get(COINBASE_URL)
    const ethPerUSD = coinbaseResponse.data.data.rates.ETH

    // check whether transaction hash is there on etherscan and check the amount paid
    const etherscanResponse = await axios.get(`https://api-ropsten.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${tx.hash}&apikey=${process.env.ETHERSCAN_API_KEY}`)
    const txDetailsFromEtherscan = etherscanResponse.data.result
    const ethPaid = parseInt(txDetailsFromEtherscan.value, 16) / 10 ** 18
    const ethPaidUSD = ethPaid * ethPerUSD

    if (ethPaidUSD < 4.5) {
        res.json({
            success: false,
            message: "Not enough USD paid"
        })
    }

    // check if appropriate amount paid in eth

    // check if same address not already used to create username

    // if yes, then assign username in mongodb, otherwise reject

    return res.json(req.body)



})


app.listen(3001, () => {
    console.log('listening on port 3001')
})