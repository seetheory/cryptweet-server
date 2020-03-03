const express = require('express')
const app = express()
const puppeteer = require('puppeteer')

app.use(express.json())
app.use((req, res, next) => {
  res.set('access-control-allow-origin', '*')
  res.set('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.set('access-control-allow-headers', 'origin, content-type, access-control-allow-origin')
  next()
})

/**
 * Load the publicly shared key for a twitter account
 **/
app.get('/publickey', async (req, res) => {
  const { user } = req.query
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  page.on('response', async (_res) => {
    let data
    try {
      data = await _res.json()
    } catch (err) { return }
    try {
      const url = decodeURIComponent(_res.url())
      if (
        url.indexOf('UserByScreenName' !== -1) &&
        url.indexOf(`"screen_name":"${user}"`) !== -1
      ) {
        // console.log(data.data.user.legacy)
        const addressRegex = /0x[0-9a-fA-F]{66}/g
        const profile = data.data.user.legacy
        const match = profile.description.match(addressRegex)
        if (match.length === 0) return
        res.json({
          publicKey: match[0]
        })
        await browser.close()
      }
    } catch (err) {
      console.log(err)
    }
  })
  await Promise.all([
    page.goto(`https://twitter.com/${user}`),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  ])
  // console.log(await page.content())
  // await new Promise(r => setTimeout(r, 2000))
  // const el = await page.$eval('div[data-testid="UserDescription"]')
  // console.log(el)
  // await browser.close()
})

/**
 * Send an encrypted string for
 **/
app.get('/encrypt', async (req, res) => {
})

app.get('/eos/:username', async (req, res) => {

})

app.get('/eth/:address', async (req, res) => {

})

// To set we can directly send a transaction
// Sign from browser and move with a post request
app.post('/eos/transaction', async (req, res) => {

})

app.post('/eth/transaction', async (req, res) => {

})

app.listen(4000)
