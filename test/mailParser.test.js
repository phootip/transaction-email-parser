import * as mailParser from "../src/mailParser.js"
import * as gmail from "../src/gmail.js"
import * as fs from 'fs'
import _ from 'lodash'
import moment from "moment"
import { exit } from "process"

async function mailParser_test() {
	for (let i of Array(7).keys()) {
		console.log('testcase: ' + i)
		try {
			// let rawdata = fs.readFileSync(`./test/testcase_data/mail${i}.json`);
			let rawdata = fs.readFileSync(`./tmp/testcase/scb/mail${i}.json`);
			let mail = JSON.parse(rawdata);
			let result = mailParser.mailToTransaction(mail)
			// let expect = fs.readFileSync(`./test/testcase_expect/${i}.json`)
			// fs.writeFileSync(`./test/testcase_expect/${i}.json`, JSON.stringify(result))
			// console.log(_.isEqual(JSON.parse(JSON.stringify(result)),JSON.parse(expect)))
			console.log(result)
		} catch (e) {
			console.log(e)
		}
	}
}
// test('gmail', mailParser_test)
mailParser_test()
