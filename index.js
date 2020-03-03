const express = require('express')
const puppeteer = require('puppeteer-core')
const chrome = require('chrome-aws-lambda')

const app = express()
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
app.get('/publickey/:user', async (req, res) => {
  const { user } = req.params
  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless
  })
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
        console.log(data)
        // console.log(data.data.user.legacy)
        const addressRegex = /0x[0-9a-fA-F]{66}/g
        const profile = data.data.user.legacy
        const match = profile.description.match(addressRegex)
        if (match.length === 0) {
          res.status(404).json({ error: 'No public key found in user description' })
        } else {
          res.set('Cache-Control', `max-age=${60 * 60}, s-maxage=${60 * 60}`)
          res.json({
            publicKey: match[0]
          })
        }
        await browser.close()
      }
    } catch (err) {
      console.log(err)
    }
  })
  await page.goto(`https://twitter.com/${user}`)
})

module.exports = app
