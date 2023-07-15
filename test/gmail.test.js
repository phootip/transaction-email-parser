import * as mailParser from "../src/mailParser.js"
import * as gmail from "../src/gmail.js"
import * as fs from 'fs'

let labelIds = ['Label_4253791268172259692']

async function run() {
	// let mails = await gmail.listMailIds(labelIds)
	// for (const [i, id] of mails.entries()) {
	// 	console.log(i,id)
	// 	let mail = await gmail.readMail(id)
	// 	await fs.writeFileSync(`./tmp/testcase/mail${i}.json`, JSON.stringify(mail))
	// }
	for (let i of Array(100).keys()) {
		// i = 1
		let rawdata = fs.readFileSync(`./tmp/testcase/mail${i}.json`);
		let mail = JSON.parse(rawdata);
		let a = mailParser.mailToTransaction(mail)
		console.log(i)
		console.log(a)
		// break
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
