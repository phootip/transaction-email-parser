import * as mailParser from "../src/mailParser.js"
import * as gmail from "../src/gmail.js"
import * as fs from 'fs'
import moment from "moment"

let labelIds = ['Label_4253791268172259692']

async function run() {
	// let before = moment().format('YYYY/MM/DD')
	// let after = moment().add({days:-1}).format('YYYY/MM/DD')
	// let mails = await gmail.listMailIds({ labelIds,q:`before:${before} after:${after}` })
	// console.log(mails, mails.length)
	// for (const [i, id] of mails.entries()) {
	// 	console.log(i,id)
	// 	let mail = await gmail.readMail(id)
	// 	// await fs.writeFileSync(`./tmp/testcase/mail${i}.json`, JSON.stringify(mail))
	// 	try {
	// 	console.log(mailParser.mailToTransaction(mail))
	// 	} catch (e) {
	// 		console.log(e.message)
	// 	}
	// }
	for (let i of Array(4).keys()) {
		console.log(i)
		try {
			let rawdata = fs.readFileSync(`./test/testcase/mail${i}.json`);
			// let rawdata = fs.readFileSync(`./tmp/testcase/mail${i}.json`);
			let mail = JSON.parse(rawdata);
			console.log(mailParser.mailToTransaction(mail))
		} catch (e) {
			console.log(e.message)
		}
	}
	// let mail = await gmail.readMail(mails[1])
	// mail = await gmail.readMail(mails[6])
	// let a = mailParser.mailToTransaction(mail)
	// await console.log(a)
	// expect(1).toBe(1)
	// gmail.watcher()
}
// test('gmail', run)
run()
