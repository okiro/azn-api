const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');

const { getLatestXML, getJSON } = require('./modules/getRate')

const app = express();
const PORT = process.env.PORT || 5500

let jsonResponse;

setInterval(async function() {
    jsonResponse = await getJSON()
}, 5 * 60 * 1000)

setInterval(async function() {
    getLatestXML()
}, 10 * 60 * 1000)

app.use(morgan('tiny'));
app.use(helmet());

app.get('/getRate', (req, res) => {
    if (jsonResponse) {
        res.json(jsonResponse);

    } else {
        res.json({ status: 'not ready' })
    }

})


app.listen(PORT, () => {
    console.log(`(server is listening at port:${PORT}`)
})