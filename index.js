const express = require('express');
const app = express();
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 5000

const config = {
   channelAccessToken:process.env.ACCESS_TOKEN,
   channelSecret:process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

app
   .post('/hook',line.middleware(config),(req,res)=> lineBot(req,res))
   .listen(PORT,()=>console.log(`Listening on ${PORT}`));

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
         }

         
   }
   Promise
         .all(promises)
         .then(console.log('all promises passed'))
         .catch(e=>console.error(e.stack));
}

const greeting_follow = async (ev) => {
   const profile = await client.getProfile(ev.source.userId);
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
  }else{
      return client.replyMessage(ev.replyToken,{
          "type":"text",
          "text":`${profile.displayName}さん、今${text}って言いました？`
      });
  }
}

const orderChoice = (ev) => {
   return client.replyMessage(ev.replyToken,{
       "type":"flex",
       "altText":"menuSelect",
       "contents":
       {
         "type": "bubble",
         "header": {
           "type": "box",
           "layout": "vertical",
           "contents": [
             {
               "type": "text",
               "text": "メニューを選択してください",
               "size": "lg",
               "align": "center"
             }
           ]
         },
         "hero": {
           "type": "box",
           "layout": "vertical",
           "contents": [
             {
               "type": "text",
               "text": "(１つのみ選択可能です)",
               "size": "md",
               "align": "center"
             },
             {
               "type": "separator"
             }
           ]
         },
         "body": {
           "type": "box",
           "layout": "vertical",
           "contents": [
             {
               "type": "box",
               "layout": "horizontal",
               "contents": [
                 {
                   "type": "button",
                   "action": {
                     "type": "postback",
                     "label": "カット",
                     "data": "menu&0"
                   },
                   "margin": "md",
                   "style": "primary",
                   "color": "#999999"
                 },
                 {
                   "type": "button",
                   "action": {
                     "type": "postback",
                     "label": "シャンプー",
                     "data": "menu&1"
                   },
                   "margin": "md",
                   "style": "primary",
                   "color": "#999999"
                 }
               ],
               "margin": "md"
             },
             {
               "type": "box",
               "layout": "horizontal",
               "contents": [
                 {
                   "type": "button",
                   "action": {
                     "type": "postback",
                     "label": "ｶﾗｰﾘﾝｸﾞ",
                     "data": "menu&2"
                   },
                   "margin": "md",
                   "style": "primary",
                   "color": "#999999"
                 },
                 {
                   "type": "button",
                   "action": {
                     "type": "postback",
                     "label": "ヘッドスパ",
                     "data": "menu&3"
                   },
                   "margin": "md",
                   "style": "primary",
                   "color": "#999999"
                 }
               ],
               "margin": "md"
             },
             {
               "type": "box",
               "layout": "horizontal",
               "contents": [
                 {
                   "type": "button",
                   "action": {
                     "type": "postback",
                     "data": "menu&4",
                     "label": "ﾏｯｻｰｼﾞ&ﾊﾟｯｸ"
                   },
                   "margin": "md",
                   "style": "primary",
                   "color": "#999999"
                 },
                 {
                   "type": "button",
                   "action": {
                     "type": "postback",
                     "label": "顔そり",
                     "data": "menu&5"
                   },
                   "margin": "md",
                   "style": "primary",
                   "color": "#999999"
                 }
               ],
               "margin": "md"
             },
             {
               "type": "box",
               "layout": "horizontal",
               "contents": [
                 {
                   "type": "button",
                   "action": {
                     "type": "postback",
                     "label": "眉整え",
                     "data": "menu&6"
                   },
                   "margin": "md",
                   "style": "primary",
                   "color": "#999999"
                 },
                 {
                   "type": "button",
                   "action": {
                     "type": "postback",
                     "label": "選択終了",
                     "data": "end"
                   },
                   "margin": "md",
                   "style": "primary",
                   "color": "#0000ff"
                 }
               ],
               "margin": "md"
             },
             {
               "type": "separator"
             }
           ]
         },
         "footer": {
           "type": "box",
           "layout": "vertical",
           "contents": [
             {
               "type": "button",
               "action": {
                 "type": "postback",
                 "label": "キャンセル",
                 "data": "cancel"
               }
             }
           ]
         }
       }
   });
}
