const line = require("@line/bot-sdk");

const client = new line.Client({
  channelAccessToken: process.env.ACCESS_TOKEN,
});

client.setDefaultRichMenu(process.env.RICHMENU_ID);