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

const INITIAL_TREAT = [20,10,40,15,30,15,10];  //施術時間初期値


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

const handlePostbackEvent = async (ev) => {
   const profile = await client.getProfile(ev.source.userId);
   const data = ev.postback.data;
   const splitData = data.split('&');
   
   if(splitData[0] === 'menu'){
       const orderedMenu = splitData[1];
       askDate(ev,orderedMenu);
   }else if(splitData[0] === 'date'){
      const orderedMenu = splitData[1];
      const selectedDate = ev.postback.params.date;
      askTime(ev,orderedMenu,selectedDate);
   }else if(splitData[0] === 'time'){
      const orderedMenu = splitData[1];
      const selectedDate = splitData[2];
      const selectedTime = splitData[3];
      confirmation(ev,orderedMenu,selectedDate,selectedTime);
   }else if(splitData[0] === 'yes'){
      const orderedMenu = splitData[1];
      const selectedDate = splitData[2];
      const selectedTime = splitData[3];
      const startTimestamp = timeConversion(selectedDate,selectedTime);
      console.log('その1');
      const treatTime = await calcTreatTime(ev.source.userId,orderedMenu);
      const endTimestamp = startTimestamp + treatTime*60*1000;
      console.log('その4');
      console.log('endTime:',endTimestamp);

      SpreadSheet.selectMaxID(1)
      .then(data => data + 1)
      .then(data => SpreadSheet.insert(1, {id:data, line_uid:ev.source.userId, name:profile.displayName, schedule_date: selectedDate, start_time: startTimestamp, end_time: endTimestamp, menu: orderedMenu}))
      .then(data =>{
        console.log('データ格納成功！');
        client.replyMessage(ev.replyToken,{
          "type":"text",
          "text":"予約が完了しました。"
        });
      })
      .catch(e=>console.log(e));

      // const insertQuery = {
      //   text:'INSERT INTO reservations (line_uid, name, scheduledate, starttime, endtime, menu) VALUES($1,$2,$3,$4,$5,$6);',
      //   values:[ev.source.userId,profile.displayName,selectedDate,startTimestamp,endTimestamp,orderedMenu]
      // };
      // connection.query(insertQuery)
      //   .then(res=>{
      //     console.log('データ格納成功！');
      //     client.replyMessage(ev.replyToken,{
      //       "type":"text",
      //       "text":"予約が完了しました。"
      //     });
      //   })
      //   .catch(e=>console.log(e));

  }else if(splitData[0] === 'no'){
    // あとで何か入れる
  }
}

const askDate = (ev,orderedMenu) => {
   return client.replyMessage(ev.replyToken,{
       "type":"flex",
       "altText":"予約日選択",
       "contents":
       {
         "type": "bubble",
         "body": {
           "type": "box",
           "layout": "vertical",
           "contents": [
             {
               "type": "text",
               "text": "来店希望日を選んでください。",
               "align": "center"
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
                 "type": "datetimepicker",
                 "label": "希望日を選択する",
                 "data": `date&${orderedMenu}`,
                 "mode": "date"
               }
             }
           ]
         }
       }
   });
}

const askTime = (ev,orderedMenu,selectedDate) => {
   return client.replyMessage(ev.replyToken,{
       "type":"flex",
       "altText":"予約日選択",
       "contents":
       {
         "type": "bubble",
         "body": {
           "type": "box",
           "layout": "vertical",
           "contents": [
             {
               "type": "box",
               "layout": "vertical",
               "contents": [
                 {
                   "type": "text",
                   "text": "ご希望の時間帯を選択してください（緑=予約可能です）",
                   "align": "center"
                 },
                 {
                   "type": "separator",
                   "margin": "md"
                 }
               ]
             },
             {
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
                         "label": "9時~",
                         "data": `time&${orderedMenu}&${selectedDate}&0`
                       },
                       "style": "primary",
                       "margin": "md"
                     },
                     {
                       "type": "button",
                       "action": {
                         "type": "postback",
                         "label": "10時~",
                         "data": `time&${orderedMenu}&${selectedDate}&1`
                       },
                       "style": "primary",
                       "margin": "md"
                     },
                     {
                       "type": "button",
                       "action": {
                         "type": "postback",
                         "label": "11時~",
                         "data": `time&${orderedMenu}&${selectedDate}&2`
                       },
                       "style": "primary",
                       "margin": "md"
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
                         "label": "12時~",
                         "data": `time&${orderedMenu}&${selectedDate}&3`
                       },
                       "style": "primary",
                       "margin": "md"
                     },
                     {
                       "type": "button",
                       "action": {
                         "type": "postback",
                         "label": "13時~",
                         "data": `time&${orderedMenu}&${selectedDate}&4`
                       },
                       "style": "primary",
                       "margin": "md"
                     },
                     {
                       "type": "button",
                       "action": {
                         "type": "postback",
                         "label": "14時~",
                         "data": `time&${orderedMenu}&${selectedDate}&5`
                       },
                       "style": "primary",
                       "margin": "md"
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
                         "label": "15時~",
                         "data": `time&${orderedMenu}&${selectedDate}&6`
                       },
                       "style": "primary",
                       "margin": "md"
                     },
                     {
                       "type": "button",
                       "action": {
                         "type": "postback",
                         "label": "16時~",
                         "data": `time&${orderedMenu}&${selectedDate}&7`
                       },
                       "style": "primary",
                       "margin": "md"
                     },
                     {
                       "type": "button",
                       "action": {
                         "type": "postback",
                         "label": "17時~",
                         "data": `time&${orderedMenu}&${selectedDate}&8`
                       },
                       "style": "primary",
                       "margin": "md"
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
                         "label": "18時~",
                         "data": `time&${orderedMenu}&${selectedDate}&9`
                       },
                       "style": "primary",
                       "margin": "md"
                     },
                     {
                       "type": "button",
                       "action": {
                         "type": "postback",
                         "label": "19時~",
                         "data": `time&${orderedMenu}&${selectedDate}&10`
                       },
                       "style": "primary",
                       "margin": "md"
                     },
                     {
                       "type": "button",
                       "action": {
                         "type": "postback",
                         "label": "終了",
                         "data": "end"
                       },
                       "style": "primary",
                       "margin": "md",
                       "color": "#0000ff"
                     }
                   ],
                   "margin": "md"
                 }
               ]
             }
           ]
         }
       }
   });
}

const confirmation = (ev,menu,date,time) => {
   const splitDate = date.split('-');
   const selectedTime = 9 + parseInt(time);
   
   return client.replyMessage(ev.replyToken,{
     "type":"flex",
     "altText":"menuSelect",
     "contents":
     {
      "type": "bubble",
      "body": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": `次回予約は${splitDate[1]}月${splitDate[2]}日 ${selectedTime}時〜でよろしいですか？`,
            "wrap": true
          },
          {
            "type": "separator"
          }
        ]
      },
      "footer": {
        "type": "box",
        "layout": "horizontal",
        "contents": [
          {
            "type": "button",
            "action": {
              "type": "postback",
              "label": "はい",
              "data": `yes&${menu}&${date}&${time}`
            }
          },
          {
            "type": "button",
            "action": {
              "type": "postback",
              "label": "いいえ",
              "data": `no&${menu}&${date}&${time}`
            }
          }
        ]
      }
    }
   });
  }


  const timeConversion = (date,time) => {
    const selectedTime = 9 + parseInt(time) - 9;
    return new Date(`${date} ${selectedTime}:00`).getTime();
   }


   const calcTreatTime = (id,menu) => {
    return new Promise((resolve,reject)=>{
      console.log('その2');

      SpreadSheet.select(0, row => row. line_uid == id)
        .then(res=>{
          console.log('その3');
          console.log(res);
          // console.log(res.rows);
          if(res.length){
            const info = res[0];
            const treatArray = [info.cut_time,info.shampoo_time,info.color_time,info.spa_time,INITIAL_TREAT[4],INITIAL_TREAT[5],INITIAL_TREAT[6]];
            const menuNumber = parseInt(menu);
            const treatTime = treatArray[menuNumber];
            resolve(treatTime);
          }else{
            console.log('LINE　IDに一致するユーザーが見つかりません。');
            return;
          }
        })
        .catch(e=>console.log(e));
      // const selectQuery = {
      //   text: 'SELECT * FROM users WHERE line_uid = $1;',
      //   values: [`${id}`]
      // };
      // connection.query(selectQuery)
      //   .then(res=>{
      //     console.log('その3');
      //     if(res.rows.length){
      //       const info = res.rows[0];
      //       const treatArray = [info.cuttime,info.shampootime,info.colortime,info.spatime,INITIAL_TREAT[4],INITIAL_TREAT[5],INITIAL_TREAT[6]];
      //       const menuNumber = parseInt(menu);
      //       const treatTime = treatArray[menuNumber];
      //       resolve(treatTime);
      //     }else{
      //       console.log('LINE　IDに一致するユーザーが見つかりません。');
      //       return;
      //     }
      //   })
      //   .catch(e=>console.log(e));

      
    });
   }


