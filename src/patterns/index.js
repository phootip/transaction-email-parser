import moment from 'moment';

const compilePattern = (pattern) => {
	return new RegExp(pattern.split(/\s+/).join('\\s*'))
}
const parser = {
	none: (text) => text,
	addName: (name) => (text) => name + ' ' + text,
	amount: (text) => parseFloat(text.replace(',', '')),
	thaiDate: (text) => thaiDateToISO(text)
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

export default {
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
