import * as fs from 'fs';
import { content_v2_1 } from 'googleapis';
import { Base64 } from 'js-base64';
import moment from 'moment';
import escapeStringRegexp from 'escape-string-regexp';
import { exit } from 'process';
import { threadId } from 'worker_threads';

const compilePattern = (pattern) => {
	return new RegExp(pattern.split(/\s+/).join('\\s*'))
}
const parser = {
	none: (text) => text,
	addName: (name) => (text) => name + ' ' + text,
	amount: (text) => parseFloat(text.replace(',', '')),
	thaiDate: (text) => thaiDateToISO(text)
}
const patterns = {
	'SCB Easy <scbeasynet@scb.co.th>': {
		deposit_promptpay: {
			regexs: {
				source_provider: { regex: compilePattern('จาก: ([^\\s]+) / x+[0-9]{4}'), parse: parser.none },
				source: { regex: compilePattern('จาก: [^\\s]+ / (x+[0-9]{4})'), parse: parser.none },
				destination: { regex: compilePattern('เข้าบัญชี: (x+[0-9]{4})'), parse: parser.none },
				amount: { regex: compilePattern('จำนวน \\(บาท\\): ([0-9,.-]+)'), parse: parser.amount },
				date: { regex: compilePattern('วัน/เวลา: ([0-9]{1,2}.+[0-9]{4}) - ([0-9]{1,2}:[0-9]{2})'), parse: thaiDateToISO }
			},
			extras: {
				type: 'deposit',
				destination_provider: 'SCB'
			}
		},
		payment: {
			regexs: {
				source: { regex: compilePattern('จาก ธนาคารไทยพาณิชย์ เบอร์บัญชี (x+[0-9]{4})'), parse: parser.none },
				destination: { regex: compilePattern('ไปยัง ผู้ให้บริการ เบอร์บัญชี ([0-9]+)'), parse: parser.none },
				amount: { regex: compilePattern('จำนวนเงิน ([0-9,.-]+) บาท'), parse: parser.amount },
				date: { regex: compilePattern('วันและเวลาการทำรายการ: ([0-9]{1,2}.+[0-9]{4}) ณ ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: thaiDateToISO }
			},
			extras: {
				type: 'payment',
				source_provider: 'SCB'
			}
		},
		payment_promptpay: {
			regexs: {
				source: { regex: compilePattern('จาก ธนาคารไทยพาณิชย์ เบอร์บัญชี (x+[0-9]{4})'), parse: parser.none },
				destination: { regex: compilePattern('ไปยัง หมายเลขพร้อมเพย์ผู้รับเงิน ([0-9]+)'), parse: parser.none },
				amount: { regex: compilePattern('จำนวนเงิน ([0-9,.-]+) บาท'), parse: parser.amount },
				date: { regex: compilePattern('วันและเวลาการทำรายการ: ([0-9]{1,2}.+[0-9]{4}) ณ ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: thaiDateToISO }
			},
			extras: {
				type: "payment",
				source_provider: 'SCB',
				destination_provider: 'PromptPay'
			}
		},
		payment_ewallet: {
			regexs: {
				source: { regex: compilePattern('จาก ธนาคารไทยพาณิชย์ เบอร์บัญชี (x+[0-9]{4})'), parse: parser.none },
				destination: { regex: compilePattern('e-Wallet ID ([0-9]+)'), parse: parser.none },
				amount: { regex: compilePattern('จำนวนเงิน ([0-9,.-]+) บาท'), parse: parser.amount },
				date: { regex: compilePattern('วันและเวลาการทำรายการ: ([0-9]{1,2}.+[0-9]{4}) ณ ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: thaiDateToISO }
			},
			extras: {
				type: "payment",
				source_provider: 'SCB',
				destination_provider: 'e-Wallet'
			}
		},
		transfer: {
			regexs: {
				source: { regex: compilePattern('จาก ธนาคารไทยพาณิชย์ เบอร์บัญชี (x+[0-9]{4})'), parse: parser.none },
				destination: { regex: compilePattern('ไปยัง [^\\s0-9]+ เบอร์บัญชี ([0-9]+)'), parse: parser.none },
				destination_provider: { regex: compilePattern('ไปยัง ([^\\s0-9]+) เบอร์บัญชี [0-9]+'), parse: parser.none },
				amount: { regex: compilePattern('จำนวนเงิน ([0-9,.-]+) บาท'), parse: parser.amount },
				date: { regex: compilePattern('วันและเวลาการทำรายการ: ([0-9]{1,2}.+[0-9]{4}) ณ ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: thaiDateToISO }
			},
			extras: {
				type: "transfer",
				source_provider: 'SCB'
			}
		}
	},
	'K PLUS <KPLUS@kasikornbank.com>': {
		transfer: {
			regexs: {
				source: { regex: compilePattern('From Account: ([x\\-0-9]+)'), parse: parser.none },
				destination: { regex: compilePattern('To Account: ([\\-0-9]+)'), parse: parser.none },
				destination_provider: { regex: compilePattern('To Bank: (.+)'), parse: parser.none },
				destination_name: { regex: compilePattern('Account Name: (.+)'), parse: parser.none },
				amount: { regex: compilePattern('Amount \\(THB\\): ([0-9,.-]+)'), parse: parser.amount },
				fee: { regex: compilePattern('Fee \\(THB\\): ([0-9,.-]+)'), parse: parser.amount },
				available_balance: { regex: compilePattern('Available Balance \\(THB\\): ([0-9,.-]+)'), parse: parser.amount },
				transaction_id: { regex: compilePattern('Transaction Number: (.+)'), parse: parser.none },
				date: { regex: compilePattern('Transaction Date: ([0-9]{1,2}/[0-9]{2}/[0-9]{4}) ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: dmyDateToISO }
			},
			extras: {
				type: "transfer",
				source_provider: 'Kasikorn'
			}
		}
	}
}

export function mailToTransaction(mail) {
	let mailObj = headerTokenizer(mail)
	let patternMapping
	switch (mailObj.From) {
		case 'SCB Easy <scbeasynet@scb.co.th>':
			mailObj.body = scbBodyExtractor(mail)
			patternMapping = scbPatternPicker(mailObj)
			break;
		case 'K PLUS <KPLUS@kasikornbank.com>':
			mailObj.body = defaultBodyExtractor(mail)
			patternMapping = kbankPatternPicker(mailObj)
			break;
	}
	const output = { ...patternMapping.extras }
	// console.log(patternMapping)
	// console.log(mailObj.body)
	for (const [key, pattern] of Object.entries(patternMapping.regexs)) {
		const values = pattern.regex.exec(mailObj.body)
		if (!values) continue
		const valuesString = values.slice(1).join(' ')
		output[key] = pattern.parse(valuesString)
	}
	output
	output.url = mailObj.url
	return output
}

function headerTokenizer(mail) {
	let output = {
		snippet: mail.data.snippet,
		threadId: mail.data.threadId,
	}
	for (const header of mail.data.payload.headers) {
		if (header.name === 'From') output.From = header.value
		if (header.name === 'Subject') output.Subject = header.value
	}
	if (!(output.From in patterns)) throw new Error(`Sender not supported - ${output.From}`)
	output.url = `https://mail.google.com/mail/#inbox/${output.threadId}`
	return output
}

function defaultBodyExtractor(mail) {
	let body = mail.data.payload.body.data
	body = Base64.decode(body)
	return body
}

function scbBodyExtractor(mail) {
	let body = mail.data.payload.parts[0].parts[0].body.data
	body = Base64.decode(body).replace(/<td>|<\/td>|<tr>|<\/tr>|<BR>/g, ' ')
	return body
}

function scbPatternPicker(mailObj) {
	if (mailObj.body.includes('รับเงินผ่านรายการพร้อมเพย์')) return patterns[mailObj.From]['deposit_promptpay']
	if (mailObj.body.includes('ชำระค่าสินค้าและบริการ')) return patterns[mailObj.From]['payment']
	if (mailObj.body.includes('โอนเงินพร้อมเพย์')) return patterns[mailObj.From]['payment_promptpay']
	if (mailObj.body.includes('เติมเงินพร้อมเพย์')) return patterns[mailObj.From]['payment_ewallet']
	if (mailObj.body.includes('โอนเงินไปธนาคารอื่น')) return patterns[mailObj.From]['transfer']
	throw new Error(`Subject not supported - sender: ${mailObj.From}, subject: ${mailObj.Subject}, link:${mailObj.url}`)
}

function kbankPatternPicker(mailObj) {
	if (mailObj.body.includes('Result of Funds Transfer (Success)')) return patterns[mailObj.From]['transfer']
}

function dmyDateToISO(d) {
	console.log(d)
	return moment(d, 'DD/MM/YYYY hh:mm:ss').toDate()
}

function thaiDateToISO(thaiDate) {
	var monthNamesThai = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
	var monthNamesEng = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
	thaiDate = thaiDate.split(' ')
	let idx = monthNamesThai.indexOf(thaiDate[1])
	let engDate = thaiDate
	engDate[2] = parseInt(thaiDate[2]) - 543
	engDate[1] = monthNamesEng[idx]
	// engDate.splice(3, 1)
	return moment(engDate.join(' '), 'DD MMM YYYY hh:mm:ss').toDate()
}
