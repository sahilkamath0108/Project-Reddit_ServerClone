require("dotenv").config();

const { Vonage } = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: process.env.VONAGEAPIKEY,
  apiSecret: process.env.VONAGEAPISECRET
})

const from = "Vonage APIs"
const to = "917506373478"
const text = 'A text message sent using the Vonage SMS API'

async function sendSMS() {
    await vonage.sms.send({to, from, text})
        .then(resp => { console.log('Message sent successfully'); console.log(resp); })
        .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
}

module.exports = {
    sendSMS
}