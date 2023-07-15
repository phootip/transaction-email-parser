import { content_v2_1 } from 'googleapis';
import { Base64 } from 'js-base64';
import moment from 'moment';

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
	console.log(mail.Subject)
	console.log(mail.body)
	let result = {}
	let body = mail.body.split('<BR><BR>')
	if (mail.Subject.includes('รับเงิน')) {
		//  SCB Easy App:  คุณได้รับเงินผ่านรายการพร้อมเพย์
		let detail = body[2].split('<BR>')
		detail = detail.map(e => e.substring(e.indexOf(':') + 1).trim());
		result.source = detail[0]
		result.amount = parseFloat(detail[1].replace(',', ''))
		result.destination = detail[2]
		result.date = moment(thaiDateToISO(detail[3]))
	} else if (mail.Subject.includes('ทำธุรกรรม')) {
		//  แจ้งเตือนจากแอป SCB Easy: บริการอัตโนมัติแจ้งเตือนการทำธุรกรรม
		

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
	engDate.splice(3, 1)
	return engDate.join(' ')
}
