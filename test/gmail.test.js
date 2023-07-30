import * as mailParser from "../src/mailParser.js"
import * as gmail from "../src/gmail.js"
import * as fs from 'fs'
import _ from 'lodash'
import dayjs from "dayjs"
import { exit } from "process"

// const bank_list = ['scb easy', 'k plus', 'kkp', 'aisebill', 'onlineservice']
const bank_list = ['scb easy']
// const label = 'INBOX'
const label = 'money-transaction'
const limit = 5

async function gmailTest() {
	for (const bank of bank_list) {
		console.log(`testing bank: ${bank}`)
		let mails = await gmail.listMailIds({ q: `label:${label} ${bank}` })
		console.log(mails, mails.length)
		for (const [i, id] of mails.entries()) {
			// if (i !== 12) continue
			// if (i < 79) continue
			if (i >= limit) break
			console.log(i, id)
			let mail = await gmail.readMail(id)
			// await fs.writeFileSync(`./tmp/testcase/ktc/mail${i}.json`, JSON.stringify(mail))
			try {
				let transaction = mailParser.mailToTransaction(mail)
				console.log(transaction)
				if (Object.prototype.toString.call(d) === "[object Date]" && isNaN(d)) { throw new Error(`Date not valid!`); exit(); }
			} catch (e) {
				console.log(e.message)
			}
		}
	}
}

gmailTest()
