import * as fs from 'fs';
import { content_v2_1 } from 'googleapis';
import { Base64 } from 'js-base64';
import moment from 'moment';

const mailRegex = {
	'SCB Easy <scbeasynet@scb.co.th>': {
		deposit: {
			source: new RegExp('จาก: (.+) / (x+[0-9]{4})', 'i'),
			destination: new RegExp('เข้าบัญชี: (x+[0-9]{4})', 'i'),
			amount: new RegExp('จำนวน \\(บาท\\): ([0-9,.-]+)', 'i'),
			date: new RegExp('วัน/เวลา: ([0-9]{2}\.+[0-9]{4}) - ([0-9]{2}:[0-9]{2})', 'i')
		},
		payment: {
			source: new RegExp('<td>จาก ธนาคารไทยพาณิชย์ เบอร์บัญชี<\/td><td> (x+[0-9]{4})<\/td>', 'i'),
			destination: new RegExp('<td>ไปยัง หมายเลขพร้อมเพย์ผู้รับเงิน<\/td><td> ([0-9]{10})<\/td>', 'i'),
			amount: new RegExp('<td>จำนวนเงิน<\/td><td> ([0-9,.-]+) บาท<\/td>', 'i'),
			date: new RegExp('<td>วันและเวลาการทำรายการ:<\/td><td>([0-9]{2}\.+[0-9]{4}) ณ ([0-9]{2}:[0-9]{2}:[0-9]{2})<\/td>', 'i')
		},
	}
}

export function mailToTransaction(mail) {
	let mailObj = mailParser(mail)
	switch (mailObj.From) {
		case "SCB Easy <scbeasynet@scb.co.th>":
			return scbParser(mailObj)
			break;
		default:
			break;
	}

	throw new Error('sender not supported')
}

function mailParser(mail) {
	let result = {
		body: mail.data.payload.parts[0].parts[0].body.data,
		snippet: mail.data.snippet
	}
	result.body = Base64.decode(result.body)
	for (const header of mail.data.payload.headers) {
		if (header.name === "From") {
			result.From = header.value
		}
		if (header.name === 'Subject') {
			result.Subject = header.value
		}
	}
	return result
}

function scbParser(mail) {
	console.log('parsing scb easy...')
	let result = {}
	let body = mail.body.split('<BR><BR>')
	fs.writeFileSync('./tmp/values.txt', mail.body)
	let regexMapping
	if (mail.Subject.includes('รับเงิน')) {
		//  SCB Easy App:  คุณได้รับเงินผ่านรายการพร้อมเพย์
		regexMapping = mailRegex[mail.From]['deposit']
	} else if (mail.Subject.includes('ทำธุรกรรม') && mail.body.includes('พร้อมเพย์')) {
		//  แจ้งเตือนจากแอป SCB Easy: บริการอัตโนมัติแจ้งเตือนการทำธุรกรรม
		regexMapping = mailRegex[mail.From]['payment']
	}
	for (const [key, regex] of Object.entries(regexMapping)) {
		const values = regex.exec(mail.body)
		if (!values) continue
		const valuesString = values.slice(1).join(' ')
		if (key === 'amount') {
			result[key] = parseFloat(valuesString.replace(',',''))
		}
		else if (key === 'date') {
			result[key] = thaiDateToISO(valuesString)
		}
		else {
			result[key] = valuesString
		}
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
