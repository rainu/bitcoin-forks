var Handlebars = require('handlebars');
var fs = require('fs-extra');
const helper = require('./helper.js')

var source = fs.readFileSync('static/list.html', 'utf8')
var sortableJS = fs.readFileSync('static/res/sortable.js')
var w3proCss = fs.readFileSync('static/res/w3pro.css')
source = source.replace('{{{styles}}}', '<style>' + w3proCss + '</style>')
source = source.replace('{{{javascript}}}', '<script type="text/javascript">' + sortableJS + '</script>')


const crawledData = require('./input/crawl.json')
const localData = require('./input/local.js')

var mergedData = helper.mergeData(localData, crawledData)


var template = Handlebars.compile(source)


var generateListHTML = function (currentCoin, currentLanguage, currentFiat) {

    var tableAndSum = helper.getTableForksAndSumValue(currentCoin, currentFiat, currentLanguage)

    var data = {
        donations: mergedData.donations,
        languages: mergedData.languages,
        coins: mergedData.coins,
        coinsWithForks: mergedData.coins.filter(f => f.forks),
        fiats: mergedData.fiats,

        coin: currentCoin,
        language: currentLanguage,
        fiat: currentFiat,

        tableForks: tableAndSum.htmlTable,
        sumForks: tableAndSum.htmlSum,


        timestamp: Date.now()
    }

    var selectors = helper.getSelectorsLangFiatCoins(data)

    data.selectLanguages = selectors.selectLanguages
    data.selectFiats = selectors.selectFiats
    data.selectCoins = selectors.selectCoins


    var result = template(data)

    return result
}


fs.removeSync('static/dist')
fs.mkdirSync('static/dist')
mergedData.languages.map((lang) => {
    fs.mkdirSync('static/dist/' + lang.id)
    mergedData.coins.filter(f => f.forks).map((coin) => {

        fs.mkdirSync('static/dist/' + lang.id + '/' + coin.id)
        mergedData.fiats.map((fiat) => {
            var dir = 'static/dist/' + lang.id + '/' + coin.id + '/' + fiat.id
            fs.mkdirSync(dir)

            var result = generateListHTML(coin, lang, fiat)
            console.log('generate', dir + '/index.html')
            fs.writeFileSync(dir + '/index.html', result)
        })
    })

})
fs.copySync('static/dist/en/bitcoin/dollar/index.html', 'static/dist/index.html')


/*
 var currentCoin = mergedData.coins[0]
 var currentLanguage = languages[0]
 var currentFiat = fiats[0]
 var result = generateListHTML(currentCoin, currentLanguage, currentFiat)
 console.log(result)
 fs.writeFileSync('static/output.html', result)
 */