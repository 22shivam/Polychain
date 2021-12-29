const express = require("express")
const cors = require("cors")

const app = express()

const COINBASE_URL = "https://api.coinbase.com/v2/exchange-rates"

app.use(
    express.urlencoded({
        extended: false
    })
)
app.use(express.json())
app.use(cors())


app.post("/register", (req, res) => {
    // transaction data coming succesfully in req.body!
    const coinbaseResponse = await fetch("https://api.coinbase.com/v2/exchange-rates")
    const data = await coinbaseResponse.json()
    const ethPerUSD = data.data.rates.ETH

    // check whether transaction hash is there on etherscan and check the amount paid
    return res.json(req.body)



})


app.listen(3001, () => {
    console.log('listening on port 3001')
})