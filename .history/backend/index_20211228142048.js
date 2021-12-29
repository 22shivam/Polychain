const express = require("express")
const cors = require("cors")
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


app.post("/register", async (req, res) => {
    // transaction data coming succesfully in req.body!
    tx = req.body

    // check coinbase rate
    const coinbaseResponse = await fetch(COINBASE_URL)
    const data = await coinbaseResponse.json()
    const ethPerUSD = data.data.rates.ETH
    // check whether transaction hash is there on etherscan and check the amount paid
    const etherscanResponse = await fetch(`https://api.etherscan.io/api
    ?module=proxy
    &action=eth_getTransactionByHash
    &txhash=${tx.hash}
    &apikey=${process.env.ETHERSCAN_API_KEY}`)

    return res.json(req.body)



})


app.listen(3001, () => {
    console.log('listening on port 3001')
})