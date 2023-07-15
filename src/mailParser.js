import * as fs from 'fs';
import { content_v2_1 } from 'googleapis';
import { Base64 } from 'js-base64';
import moment from 'moment';
import escapeStringRegexp from 'escape-string-regexp';
import { exit } from 'process';

const compilePattern = (pattern) => {
	return new RegExp(pattern.split(/\s+/).join('\\s*'))
}

const mailRegex = {
	'SCB Easy <scbeasynet@scb.co.th>': {
		deposit: {
			source: compilePattern('จาก: (.+) / (x+[0-9]{4})'),
			destination: compilePattern('เข้าบัญชี: (x+[0-9]{4})'),
			amount: compilePattern('จำนวน \\(บาท\\): ([0-9,.-]+)'),
			date: compilePattern('วัน/เวลา: ([0-9]{2}.+[0-9]{4}) - ([0-9]{2}:[0-9]{2})')
		},
		payment: {
			source: compilePattern('จาก ธนาคารไทยพาณิชย์ เบอร์บัญชี (x+[0-9]{4})'),
			destination: compilePattern('ไปยัง [^\\s0-9]+ [^\\s0-9]* ([0-9]+)'),
			amount: compilePattern('จำนวนเงิน ([0-9,.-]+) บาท'),
			date: compilePattern('วันและเวลาการทำรายการ: ([0-9]{2}.+[0-9]{4}) ณ ([0-9]{2}:[0-9]{2}:[0-9]{2})')
		}
	}
}
export function mailToTransaction(mail) {
	let mailObj = mailTokenizer(mail)
	switch (mailObj.From) {
		case "SCB Easy <scbeasynet@scb.co.th>":
			return scbParser(mailObj)
			break;
		default:
			break;
	}

	throw new Error('sender not supported')
}

function mailTokenizer(mail) {
	let result = {
		snippet: mail.data.snippet
	}
	for (const header of mail.data.payload.headers) {
		if (header.name === "From") {
			result.From = header.value
		}
		if (header.name === 'Subject') {
			result.Subject = header.value
		}
	}
	if (!(result.From in mailRegex)) throw new Error(`Sender not supported - ${result.From}`)
	result.body = mail.data.payload.parts[0].parts[0].body.data
	result.body = Base64.decode(result.body).replace(/<td>|<\/td>|<tr>|<\/tr>|<BR>/g, ' ')
	return result
}

function scbParser(mail) {
	console.log('parsing scb easy...')
	let result = {}
	let regexMapping
	// fs.writeFileSync('./tmp/payment.json',JSON.stringify(mail))
	if (mail.Subject.includes('รับเงิน')) regexMapping = mailRegex[mail.From]['deposit']
	else if (mail.Subject.includes('ทำธุรกรรม')) regexMapping = mailRegex[mail.From]['payment']
	else throw new Error(`Subject not supported - sender: ${mail.From}, subject: ${mail.Subject}`)
	for (const [key, regex] of Object.entries(regexMapping)) {
		const values = regex.exec(mail.body)
		// console.log(values)
		if (!values) continue
		const valuesString = values.slice(1).join(' ')
		if (key === 'amount') result[key] = parseFloat(valuesString.replace(',', ''))
		else if (key === 'date') result[key] = thaiDateToISO(valuesString)
		else result[key] = valuesString
	}

	return result
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
