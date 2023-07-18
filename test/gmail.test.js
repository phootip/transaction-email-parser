import * as mailParser from "../src/mailParser.js"
import * as gmail from "../src/gmail.js"
import * as fs from 'fs'
import _ from 'lodash'
import moment from "moment"
import { exit } from "process"

async function gmailTest() {
	// let before = moment().format('YYYY/MM/DD')
	// let after = moment().add({ days: -1 }).format('YYYY/MM/DD')
	// let mails = await gmail.listMailIds({q: `label:money-transaction before:${before} after:${after} k plus` })
	// let mails = await gmail.listMailIds({ q: `label:money-transaction scb easy` })
	let mails = await gmail.listMailIds({ q: `label:money-transaction k plus` })
	// let mails = await gmail.listMailIds({ q: `label:money-transaction aisebill` })
	// let mails = await gmail.listMailIds({ q: `label:money-transaction kkp` })
	console.log(mails, mails.length)
	for (const [i, id] of mails.entries()) {
		if (i !== 77) continue
		// if (i < 79) continue
		console.log(i, id)
		let mail = await gmail.readMail(id)
		// await fs.writeFileSync(`./tmp/testcase/kbank/mail${i}.json`, JSON.stringify(mail))
		try {
			console.log(mailParser.mailToTransaction(mail))
		} catch (e) {
			console.log(e)
			if (e.message.includes('แจ้งเตือนการเข้าสู่ระบบ')) continue
			if (e.message.includes('new Terms')) continue
			exit()
		}
	}
}

gmailTest()
