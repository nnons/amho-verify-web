var express = require('express')
var router = express.Router()
var sigUtils = require('@metamask/eth-sig-util')
var airtable = require('airtable')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env' })
}

airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY,
})

// Initialize a base
const base = airtable.base(process.env.AIRTABLE_BASE_ID)

router.post('/noaddress', function (req, res, next) {
  try {
    const data = req.body.data
    let { name, email, twitter, instagram, device } = data.message
    if (device.addr == (process.env.HW_ADDR_A || process.env.HW_ADDR_B)) {
      base('scans').create(
        [
          {
            fields: {
              fldq7RHiypuT53zsf: email,
              fld2gAmOiTRZldyYM: name,
              fldUTeXVUp2BktJet: twitter,
              fldDFWlOSMaXzXf4x: instagram,
              fldHuRv5Kg5p5Hu95: '0x0',
              fldWev1IbEDWaZwEj: true,
            },
          },
        ],
        function (err, records) {
          if (err) {
            console.error('No.')
            return
          }
          records.forEach(function (record) {
            console.log(record.getId())
          })
        }
      )
      res.send('Success')
    }
  } catch (err) {
    console.error(err)
  }
})

router.post('/', function (req, res, next) {
  try {
    const data = req.body.data
    const signature = req.body.signature
    let { name, email, device} = data.message
    const addr = sigUtils.recoverTypedSignature({
      data: data,
      signature: signature,
      version: sigUtils.SignTypedDataVersion.V4,
    })
    if (device.addr == (process.env.HW_ADDR_A || process.env.HW_ADDR_B)) {
      base('scans').create(
        [
          {
            fields: {
              fldq7RHiypuT53zsf: email,
              fld2gAmOiTRZldyYM: name,
              fldHuRv5Kg5p5Hu95: addr,
              fldWev1IbEDWaZwEj: true,
            },
          },
        ],
        function (err, records) {
          if (err) {
            console.error('No.')
            return
          }
          records.forEach(function (record) {
            console.log(record.getId())
          })
        }
      )
      res.send('Success')
    }
  } catch (err) {
    console.error(err)
  }
})

module.exports = router
