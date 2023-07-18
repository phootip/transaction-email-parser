import * as mailParser from "../src/mailParser.js"
import * as gmail from "../src/gmail.js"
import * as fs from 'fs'
import _ from 'lodash'
import moment from "moment"
import { exit } from "process"

let labelIds = ['Label_1393988687206709640']

async function gmailTest() {
	let before = moment().format('YYYY/MM/DD')
	// let after = moment().add({ days: -1 }).format('YYYY/MM/DD')
	let after = moment().add({ days: -90}).format('YYYY/MM/DD')
	let mails = await gmail.listMailIds({ labelIds, q: `before:${before} after:${after} k plus` })
	// let mails = await gmail.listMailIds({ labelIds, q: `label:money-transaction k plus` })
	// let mails = await gmail.listMailIds({ labelIds, q: `before:${before} after:${after} aisebill` })
	console.log(mails, mails.length)
	for (const [i, id] of mails.entries()) {
		console.log(i, id)
		let mail = await gmail.readMail(id)
		await fs.writeFileSync(`./tmp/testcase/kbank/mail${i}_kbank.json`, JSON.stringify(mail))
		try {
			console.log(mailParser.mailToTransaction(mail))
		} catch (e) {
			console.log(e)
			exit()
		}
	}
}

gmailTest()
