import * as mailParser from "../src/mailParser.js"
import * as gmail from "../src/gmail.js"
import { exportAllDeclaration } from "@babel/types"

let labelIds = ['Label_4253791268172259692']

async function run() {
	let mails = await gmail.listMailIds(labelIds)
	let mail = await gmail.readMail(mails[0])
	console.log(mail)
	let a = mailParser.mailToTransaction(mail)
	await console.log(a)
  expect(1).toBe(1)
	// let mail = await gmail.readMail(mails[1])
	// let a = mailParser.mailToTransaction(mail)
	// console.log(a)
	// gmail.watcher()
}

test('gmail',run)
