const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
const crypto = require("crypto-js")

class SpreadSheetService {
    /**
     * コンストラクター
     * @param {*} spreadsheetKey スプレッドシートキー
     */
    constructor(spreadsheetKey) {
        this.doc = new GoogleSpreadsheet(spreadsheetKey);
    }
    // /**
    //  * サービスアカウントの復号化
    //  * @param {*} encrypted_path
    //  * @param {*} decrypted_path
    //  * @param {*} password
    //  */
    // encrypt_json_key(encrypted_path, decrypted_path, password) {

    //     const encryptedKey = fs.readFileSync(encrypted_path, "utf8")
    //     const decryptedKey = crypto.AES.decrypt(encryptedKey, password).toString(crypto.enc.Utf8)
    //     fs.writeFile(decrypted_path, decryptedKey)

    // }
    /**
     * サービスアカウントを用いて認証を行う
     * @param {*} decrypted_path
     */
    async authorize(decrypted_path) {

        const credit = require(decrypted_path)

        await this.doc.useServiceAccountAuth({
            client_email: credit.client_email,
            private_key: credit.private_key,
        })

        fs.unlink(decrypted_path, (err) => {
            if (err) throw err;
            console.log('ファイルを削除しました')
        })

    }
    /**
     * 行データを返す
     * @param {*} index 
     */
    async getRows(index) {
        await this.doc.loadInfo(); 
        const sheet = this.doc.sheetsByIndex[index]
        return sheet.getRows();
    }
    /**
     * 行を追加する
     * @param {*} value 
     */
    async insert(index, value) {
        await this.doc.loadInfo(); 
        const sheet = this.doc.sheetsByIndex[index]
        return await sheet.addRow(value);
    }
    /**
     * データを取得する
     * @param {*} callBack 
     */
    async select(index, callBack) {
        const rows = await this.getRows(index)
        const data = []
        for (const row of rows) {
            if (callBack(row)) {
                // data.push({id: row.id, name: row.name, age:row.age})

                if(index == 0){
                    data.push({id:row.id, line_uid:row.line_uid, display_name:row.display_name, timestamp:row.timestamp, cut_time:row.cut_time, shampoo_time:row.shampoo_time, color_time:row.color_time, spa_time:row.spa_time})
                }else if(index == 1){
                    data.push({id:row.id, line_uid:row.line_uid, name:row.name, schedule_date:row.schedule_date, start_time:row.start_time, end_time:row.end_time, menu:row.menu})
                }
                
            }
        }
        return data
    }
    /**
     * データ内の最大IDを取得する
     * @param {*} なし
     */
     async selectMaxID(index) {
        const rows = await this.getRows(index)
        const data = []
        for (const row of rows) {
            data.push(parseInt(row.id))
        }

        // return data
        const aryMax = function (a, b) {return Math.max(a, b);}
        const max_id = data.reduce(aryMax);
        return max_id
    }
    /** 
     * idに紐づくユーザーの情報を更新する
    */
    async updateById(id, value) {
        const rows = await this.getRows(0);
        for (const row of rows) {
            if (row.id == id) {
                for (const attr in value) {
                    row[attr] = value[attr]
                    await row.save()
                }
            }
        }
    }
    /**
     * idに紐づくユーザーを削除する
     * @param {*} id 
     */
    async deleteById(id) {
        const rows = await this.getRows(0);
        for (const row of rows) {
            if (row.id == id) {
                await row.delete()
            }
        }
    }
}

module.exports = SpreadSheetService