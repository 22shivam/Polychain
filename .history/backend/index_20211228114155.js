import express from 'express';

const app = express();


app.use(
    express.urlencoded({
        extended: true
    })
)

app.use(express.json())


app.post("/register", (req, res) => {
    // extract JSON from request body



})


app.listen(3001, () => {
    console.log('listening on port 3001')
})