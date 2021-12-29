const express = require("express")

const app = express()


app.use(
    express.urlencoded({
        extended: false
    })
)

app.use(express.json())


app.post("/register", (req, res) => {
    // extract JSON from request body
    console.log(req.body)
    return res.json(req.body)



})


app.listen(3001, () => {
    console.log('listening on port 3001')
})