const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require("express-rate-limit")
const slowDown = require("express-slow-down");

const { getLatestXML, getJSONFile } = require('./modules/getRate')

const app = express();
const PORT = process.env.PORT || 5500

const limiter = rateLimit({
    windowMs: 30 * 1000,
    max: 15
});

const speedLimiter = slowDown({
    windowMs: 30 * 1000,
    delayAfter: 5,
    delayMs: 300
});

let jsonResponse
jsonResponse = await getJSONFile()
getLatestXML()

setInterval(async function() {
    jsonResponse = await getJSONFile()
}, 5 * 60 * 1000)

setInterval(async function() {
    getLatestXML()
}, 10 * 60 * 1000)

app.use(morgan('tiny'));
app.use(helmet());

app.get('/latest', cors(), limiter, speedLimiter, (req, res) => {
    if (jsonResponse) {
        res.json(jsonResponse);

    } else {
        res.json({ status: 'not ready' })
    }
})


app.listen(PORT, () => {
    console.log(`Server is listening at: ${PORT}`)
})