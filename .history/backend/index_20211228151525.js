const express = require("express")
const cors = require("cors")
const axios = require('axios');
require('dotenv').config()

const app = express()

const COINBASE_URL = "https://api.coinbase.com/v2/exchange-rates?currency=ETH"

app.use(
    express.urlencoded({
        extended: false
    })
)
app.use(express.json())
app.use(cors())


app.post("/register/sol", async (req, res) => {
    console.log(req.body)
})


app.post("/register/eth", async (req, res) => {
    // transaction data coming succesfully in req.body!
    const { tx, username } = req.body

    // check if username available in DB and check if same address not already used to create some other username

    // check coinbase rate
    const coinbaseResponse = await axios.get(COINBASE_URL)
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
    if (txDetailsFromEtherscan.to !== "0x76aEB5092D8eabCec324Be739b8BA5dF473F0055") {
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