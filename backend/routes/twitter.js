var express = require("express");
var router = express.Router();
var sigUtils = require("@metamask/eth-sig-util");
var { Client } = require("twitter-api-sdk");
var dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc')

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: ".env" });
}

const getTwitterData = async (sig) => {
  const client = new Client(process.env.TWITTER_BEARER_TOKEN);
  dayjs.extend(utc)
  const startTimeQuery = dayjs().subtract(10, 'minute').format('YYYY-MM-DDTHH:mm:ssZ');
  const endTimeQuery = dayjs().add(10, 'minute').format('YYYY-MM-DDTHH:mm:ssZ');
  console.log('startQuery: ', startTimeQuery)
  console.log('endQuery: ', endTimeQuery)
  const response = await client.tweets.usersIdMentions("1508514585288056838", {
    start_time: startTimeQuery,
    end_time: endTimeQuery,
    "tweet.fields": ["text"],
  });
  console.log('response: ', response)
  const result_count = response.meta.result_count;
  console.log('result count: ', result_count);
  if (response.data[result_count-1].text.includes(sig)) {
    return sig;
  } else {
      return sig; // NOTE: REMOVE IN PROD
  }
};

router.post("/check", async function (req, res, next) {
  const data = req.body.data;
  const { device } = data.message;
  const client_signature = req.body.signature;

  if (device.addr == (process.env.HW_ADDR_A || process.env.HW_ADDR_B)) {
    const server_signature = await getTwitterData(client_signature);
    const server_addr = sigUtils.recoverTypedSignature({
      data: data,
      signature: server_signature,
      version: sigUtils.SignTypedDataVersion.V4,
    });

    console.log("Server address: ", server_addr);
    // // Client Recovered Address

    const client_addr = sigUtils.recoverTypedSignature({
      data: data,
      signature: client_signature,
      version: sigUtils.SignTypedDataVersion.V4,
    });

    console.log("Client address: ", client_addr);

    if (server_addr === client_addr) {
      console.log("Matched address success");
      res.send(200);
    }
  }
});

module.exports = router;
