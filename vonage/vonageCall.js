require("dotenv").config();

const { Vonage } = require('@vonage/server-sdk')
const { NCCOBuilder, Talk, OutboundCallWithNCCO } = require('@vonage/voice')

const vonage = new Vonage({
  apiKey: process.env.VONAGEAPIKEY,
  apiSecret: process.env.VONAGEAPISECRET,
  applicationId: "APPLICATION_ID",
  privateKey: VONAGE_APPLICATION_PRIVATE_KEY_PATH
})

async function makeCall() {
    const builder = new NCCOBuilder();
    builder.addAction(new Talk('This is a text to speech call from Vonage'));
    const resp = await vonage.voice.createOutboundCall(
      new OutboundCallWithNCCO(
        builder.build(),
        { type: 'phone', number: 917506373478 },
        { type: 'phone', number: 917506373478}
      )
    );
  
    console.log(resp);
  }
  makeCall();