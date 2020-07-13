const puppeteer = require('puppeteer');
const axios = require('axios');
var parser = require('fast-xml-parser');
var he = require('he');
const fs = require('fs');

module.exports.getLatestXML = getLatestXML;
module.exports.getJSONFile = getJSONFile;

async function getLatestLink() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.cbar.az/currency/rates');
    await page.waitForXPath('//*[@id="mm-0"]/div[1]/div[3]/div/div/div/div[2]/a');
    const elementHandle = await page.$x('//*[@id="mm-0"]/div[1]/div[3]/div/div/div/div[2]/a');
    const text = await page.evaluate(elementHandle => elementHandle.textContent, elementHandle[0]);
    await browser.close();
    return text;
};

async function getLatestXML() {
    const link = await getLatestLink();
    try {
        const response = await axios.get(link);
        const jsonObj = xmlParser(response.data);
        writeLatestJSONFile(jsonObj);
    } catch (error) {
        console.error(error);
    }
}

function getJSONFile() {
    return new Promise((resolve, reject) => {
        fs.readFile('./json/latestRates.json', 'utf-8', (err, data) => {
            if (err) {
                throw err;
            }
            const json = JSON.parse(data.toString());
            resolve(json);
        });
    })
}

function xmlParser(xmlData) {
    var options = {
        attributeNamePrefix: "",
        attrNodeName: "", //default is 'false'
        textNodeName: "#text",
        ignoreAttributes: false,
        ignoreNameSpace: false,
        allowBooleanAttributes: false,
        parseNodeValue: true,
        parseAttributeValue: true,
        trimValues: true,
        cdataTagName: "__cdata", //default is 'false'
        cdataPositionChar: "\\c",
        parseTrueNumberOnly: false,
        arrayMode: false, //"strict"
        attrValueProcessor: (val, attrName) => he.decode(val, { isAttributeValue: true }),
        tagValueProcessor: (val, tagName) => he.decode(val),
        stopNodes: ["parse-me-as-string"]
    };

    if (parser.validate(xmlData) === true) {
        var jsonObj = parser.parse(xmlData, options);
        return jsonObj;
    }
}

function writeLatestJSONFile(jsonObj) {

    let newJson = {};
    newJson.date = jsonObj.ValCurs.Date
    newJson.rates = {};
    newJson.rates.commodities = []
    newJson.rates.currencies = []

    jsonObj.ValCurs.ValType[0].Valute.map(el => {
        newJson.rates.commodities.push({ name: el.Code, value: el.Value })
    })

    jsonObj.ValCurs.ValType[1].Valute.map(el => {
        newJson.rates.currencies.push({ name: el.Code, facevalue: el.Nominal, value: el.Value })
    })

    fs.writeFile('./json/latestRates.json', JSON.stringify(newJson), (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved." + new Date());
    })
}