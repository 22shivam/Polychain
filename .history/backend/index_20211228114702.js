const express = require("express")

const app = express()



// app.use(express.json())


app.post("/register", (req, res) => {
    // extract JSON from request body
    console.log(req.body)
    return res.send("OK")



})


app.listen(3001, () => {
    console.log('listening on port 3001')
})