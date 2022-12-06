const { GoogleSpreadsheet } = require('google-spreadsheet');

class SpreadSheetService {
    /**
     * コンストラクター
     * @param {*} spreadsheetKey スプレッドシートキー
     */
    constructor(spreadsheetKey) {
        this.doc = new GoogleSpreadsheet(spreadsheetKey);
    }
    /**
     * サービスアカウントを用いて認証を行う
     * @param {*} credit 
     */
    async authorize(credit) {
        await this.doc.useServiceAccountAuth({
            client_email: credit.client_email,
            private_key: credit.private_key,
        });
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
    async insert(value) {
        await this.doc.loadInfo(); 
        const sheet = this.doc.sheetsByIndex[0]
        return await sheet.addRow(value);
    }
    /**
     * データを取得する
     * @param {*} callBack 
     */
    async select(callBack) {
        const rows = await this.getRows(0)
        const data = []
        for (const row of rows) {
            if (callBack(row)) {
                // data.push({id: row.id, name: row.name, age:row.age})
                data.push({id:row.id, line_uid:row.line_uid, display_name:row.display_name, timestamp:row.timestamp, cut_time:row.cut_time, shampoo_time:row.shampoo_time, color_time:row.color_time, spa_time:row.spa_time})
            }
        }
        return data
    }
    /**
     * データ内の最大IDを取得する
     * @param {*} なし
     */
     async selectMaxID() {
        const rows = await this.getRows(0)
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