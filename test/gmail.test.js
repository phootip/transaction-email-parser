import * as mailParser from "../src/mailParser.js"
import * as gmail from "../src/gmail.js"
import * as fs from 'fs'
import _ from 'lodash'
import moment from "moment"
import { exit } from "process"

// const bank_list = ['scb easy', 'k plus', 'kkp', 'aisebill', 'onlineservice']
const bank_list = ['onlineservice']
const limit = 20

async function gmailTest() {
	for (const bank of bank_list) {
		console.log(`testing bank: ${bank}`)
		let mails = await gmail.listMailIds({ q: `label:money-transaction ${bank}` })
		console.log(mails, mails.length)
		for (const [i, id] of mails.entries()) {
			if (i !== 12) continue
			// if (i < 79) continue
			if (i >= limit) break
			console.log(i, id)
			let mail = await gmail.readMail(id)
			await fs.writeFileSync(`./tmp/testcase/ktc/mail${i}.json`, JSON.stringify(mail))
			try {
				console.log(mailParser.mailToTransaction(mail))
			} catch (e) {
				console.log(e)
				if (e.message.includes('แจ้งเตือนการเข้าสู่ระบบ')) continue
				if (e.message.includes('Notice of KTC app login')) continue
				if (e.message.includes('KTC Bill Payment Successful')) continue
				if (e.message.includes('Onlineservice@ktc.co.th')) continue
				if (e.message.includes('new Terms')) continue
				exit()
			}
		}
	}
}

gmailTest()
