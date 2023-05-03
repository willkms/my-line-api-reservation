const express = require('express');
const app = express();
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 5000
const SpreadSheetService = require('./spreadSheetService.js')
const fs = require('fs');
const crypto = require("crypto-js")

const config = {
   channelAccessToken:process.env.ACCESS_TOKEN,
   channelSecret:process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

var SpreadSheet = new SpreadSheetService(process.env.SPREADSHEET_KEY);

const encrypted_path = "./encrypted_key.json"
const decrypted_path= "./decrypted_key.json"
const password = process.env.SS_ENCRYPT_PASSWORD

function encrypt_json_key(encrypted_path, decrypted_path, password) {

  const encryptedKey = fs.readFileSync(encrypted_path, "utf8")
  const decryptedKey = crypto.AES.decrypt(encryptedKey, password).toString(crypto.enc.Utf8)
  fs.writeFileSync(decrypted_path, decryptedKey)

}

encrypt_json_key(encrypted_path, decrypted_path, password)
SpreadSheet.authorize(decrypted_path)

app
   .post('/hook',line.middleware(config),(req,res)=> lineBot(req,res))
   .listen(PORT,()=>console.log(`Listening on ${PORT}`));

app.use('/liff', express.static(__dirname + '/liff'));

app.post('/confirm', function(req, res) {
  var input_name = req.body['name'];
  var input_date = req.body['date'];
      res.render('confirm.html', 
          {
              name: input_name,
              date: input_date
          }
      );
  })

const lineBot = (req,res) => {
   res.status(200).end();
   const events = req.body.events;
   const promises = [];

   console.log("イベント配列", events);

   for(let i=0;i<events.length;i++){
         const ev = events[i];

         console.log("イベント要素", ev);

         switch(ev.type){
            case 'follow':
               promises.push(greeting_follow(ev));
               break;

            case 'message':
               promises.push(handleMessageEvent(ev));
               break;

            case 'postback':
               promises.push(handlePostbackEvent(ev));
               break;
         }

         
   }
   Promise
         .all(promises)
         .then(console.log('all promises passed'))
         .catch(e=>console.error(e.stack));
}

const greeting_follow = async (ev) => {
   const profile = await client.getProfile(ev.source.userId);

   await SpreadSheet.selectMaxID(0)
   .then(data => data + 1)
   .then(data => SpreadSheet.insert(0, {id:data, line_uid:ev.source.userId, display_name:profile.displayName, timestamp:ev.timestamp, cut_time:INITIAL_TREAT[0], shampoo_time:INITIAL_TREAT[1], color_time:INITIAL_TREAT[2], spa_time:INITIAL_TREAT[3]}))
  //  await SpreadSheet.insert({id:1, line_uid:ev.source.userId, display_name:profile.displayName, timestamp:ev.timestamp, cut_time:INITIAL_TREAT[0], shampoo_time:INITIAL_TREAT[1], color_time:INITIAL_TREAT[2], spa_time:INITIAL_TREAT[3]})

   return client.replyMessage(ev.replyToken,{
       "type":"text",
       "text":`${profile.displayName}さん、フォローありがとうございます\uDBC0\uDC04`
   });
}

const handleMessageEvent = async (ev) => {
   const profile = await client.getProfile(ev.source.userId);
   const text = (ev.message.type === 'text') ? ev.message.text : '';
   
   if(text === '予約する'){
      orderChoice(ev);
  }else if(text === '予約確認'){
    const nextReservation = await checkNextReservation(ev);
    const startTimestamp = nextReservation[0].start_time;
    const date = dateConversion(startTimestamp);
    const menu = MENU[parseInt(nextReservation[0].menu)];
    return client.replyMessage(ev.replyToken,{
      "type":"text",
      "text":`次回予約は${date}、${menu}でお取りしてます\uDBC0\uDC22`
    });
  }else{
      return client.replyMessage(ev.replyToken,{
          "type":"text",
          "text":`${profile.displayName}さん、今${text}って言いました？`
      });
  }
}

const orderChoice = (ev) => {
   
}


   const checkNextReservation = (ev) => {
    return new Promise((resolve,reject)=>{
      const id = ev.source.userId;
      const nowTime = new Date().getTime();

      SpreadSheet.select(1, row => row)
        .then(res=>{
          console.log(res);
          if(res.length){
            const nextReservation = res.filter(object1=>{
              return object1.line_uid === id;
            })
            .filter(object2=>{
              return parseInt(object2.start_time) >= nowTime;
            });
            console.log('nextReservation:',nextReservation);
            resolve(nextReservation);
          }else{
            resolve([]);
          }
        })
        .catch(e=>console.log(e));
   
    });
   }


   const dateConversion = (timestamp) => {
    const d = new Date(parseInt(timestamp));
    const month = d.getMonth()+1;
    const date = d.getDate();
    const day = d.getDay();
    const hour = ('0' + (d.getHours()+9)).slice(-2);
    const min = ('0' + d.getMinutes()).slice(-2);
    return `${month}月${date}日(${WEEK[day]}) ${hour}:${min}`;
   }