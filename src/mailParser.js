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
			source: { regex: compilePattern('จาก: ([^\\s]+) / (x+[0-9]{4})'), parse: parser.none },
			destination: { regex: compilePattern('เข้าบัญชี: (x+[0-9]{4})'), parse: parser.addName('SCB') },
			amount: { regex: compilePattern('จำนวน \\(บาท\\): ([0-9,.-]+)'), parse: parser.amount },
			date: { regex: compilePattern('วัน/เวลา: ([0-9]{1,2}.+[0-9]{4}) - ([0-9]{1,2}:[0-9]{2})'), parse: parser.thaiDate }
		},
		payment: {
			source: { regex: compilePattern('จาก ธนาคารไทยพาณิชย์ เบอร์บัญชี (x+[0-9]{4})'), parse: parser.addName('SCB') },
			destination: { regex: compilePattern('ไปยัง [^\\s0-9]+ [^\\s0-9]* ([0-9]+)'), parse: parser.none },
			amount: { regex: compilePattern('จำนวนเงิน ([0-9,.-]+) บาท'), parse: parser.amount },
			date: { regex: compilePattern('วันและเวลาการทำรายการ: ([0-9]{1,2}.+[0-9]{4}) ณ ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: parser.thaiDate }
		},
		payment_promptpay: {
			source: { regex: compilePattern('จาก ธนาคารไทยพาณิชย์ เบอร์บัญชี (x+[0-9]{4})'), parse: parser.addName('SCB') },
			destination: { regex: compilePattern('ไปยัง [^\\s0-9]+ ([0-9]+)'), parse: parser.addName('PromptPay') },
			amount: { regex: compilePattern('จำนวนเงิน ([0-9,.-]+) บาท'), parse: parser.amount },
			date: { regex: compilePattern('วันและเวลาการทำรายการ: ([0-9]{1,2}.+[0-9]{4}) ณ ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: parser.thaiDate }
		},
		payment_ewallet: {
			source: { regex: compilePattern('จาก ธนาคารไทยพาณิชย์ เบอร์บัญชี (x+[0-9]{4})'), parse: parser.addName('SCB') },
			destination: { regex: compilePattern('e-Wallet ID ([0-9]+)'), parse: parser.addName('e-Wallet') },
			amount: { regex: compilePattern('จำนวนเงิน ([0-9,.-]+) บาท'), parse: parser.amount },
			date: { regex: compilePattern('วันและเวลาการทำรายการ: ([0-9]{1,2}.+[0-9]{4}) ณ ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: parser.thaiDate }
		}
	}
}

export function mailToTransaction(mail) {
	const mailObj = mailTokenizer(mail)
	let patternMapping
	switch (mailObj.From) {
		case "SCB Easy <scbeasynet@scb.co.th>":
			patternMapping = scbPatternPicker(mailObj)
			break;
	}
	const result = {}
	for (const [key, pattern] of Object.entries(patternMapping)) {
		const values = pattern.regex.exec(mailObj.body)
		if (!values) continue
		const valuesString = values.slice(1).join(' ')
		result[key] = pattern.parse(valuesString)
	}
	result.url = `https://mail.google.com/mail/#inbox/${mailObj.threadId}`
	return result
}

function mailTokenizer(mail) {
	let result = {
		snippet: mail.data.snippet,
		threadId: mail.data.threadId
	}
	for (const header of mail.data.payload.headers) {
		if (header.name === "From") result.From = header.value
		if (header.name === 'Subject') result.Subject = header.value
	}
	if (!(result.From in patterns)) throw new Error(`Sender not supported - ${result.From}`)
	result.body = mail.data.payload.parts[0].parts[0].body.data
	result.body = Base64.decode(result.body).replace(/<td>|<\/td>|<tr>|<\/tr>|<BR>/g, ' ')
	fs.writeFileSync('./tmp/mail0_body.json',JSON.stringify(result.body))
	// exit()
	return result
}

function scbPatternPicker(mail) {
	if (mail.body.includes('รับเงินผ่านรายการพร้อมเพย์')) return patterns[mail.From]['deposit_promptpay']
	if (mail.body.includes('ชำระค่าสินค้าและบริการ')) return patterns[mail.From]['payment']
	if (mail.body.includes('โอนเงินพร้อมเพย์')) return patterns[mail.From]['payment_promptpay']
	if (mail.body.includes('เติมเงินพร้อมเพย์')) return patterns[mail.From]['payment_ewallet']
	throw new Error(`Subject not supported - sender: ${mail.From}, subject: ${mail.Subject}`)
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
