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
    console.log(username)

    // check coinbase rate
    const coinbaseResponse = await axios.get(COINBASE_URL)
    const data = await coinbaseResponse.json()
    const ethPerUSD = data.data.rates.ETH

    // check whether transaction hash is there on etherscan and check the amount paid
    const etherscanResponse = await fetch(`https://api.etherscan.io/api
    ?module=proxy
    &action=eth_getTransactionByHash
    &txhash=${tx.hash}
    &apikey=${process.env.ETHERSCAN_API_KEY}`)
    console.log(etherscanResponse)
    processedEtherscanResponse = await etherscanResponse.json()
    console.log("processed: ", processedEtherscanResponse)

    // check if appropriate amount paid in eth

    // if yes, then assign username in mongodb, otherwise reject

    return res.json(req.body)



})


app.listen(3001, () => {
    console.log('listening on port 3001')
})