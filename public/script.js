async function fetchRates() {
    let json
    await fetch("https://azn.tools/latest", )
        .then(r => r.json())
        .then(d => json = d)
    document.getElementById("date").textContent = `"${json.date}"`
    document.getElementById("xauValue").textContent = json.rates.commodities[3].value
    document.getElementById("usdValue").textContent = json.rates.currencies[0].value
    document.getElementById("eurValue").textContent = json.rates.currencies[1].value
}

document.addEventListener("DOMContentLoaded", () => fetchRates())