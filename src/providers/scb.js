import { parser, compilePattern } from './parser.js'
import { Base64 } from 'js-base64';

const commonPattern = {
	account: { regex: compilePattern('จาก ธนาคารไทยพาณิชย์ เบอร์บัญชี (x+[0-9]{4})'), parse: parser.none },
	amount: { regex: compilePattern('จำนวนเงิน ([0-9,.-]+) บาท'), parse: parser.debit },
	date: { regex: compilePattern('วันและเวลาการทำรายการ: ([0-9]{1,2}.+[0-9]{4}) ณ ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: parser.thaiDateToISO }
}

export default {
	'SCB Easy <scbeasynet@scb.co.th>': {
		bodyExtractor: (mail, mailObj) => {
			const body = mail.data.payload.parts[0].parts[0].body.data
			if (!body) throw new Error(`bodyExtractor Failed - sender: ${mailObj.From}, subject: ${mailObj.Subject}, link:${mailObj.url}, ref:${mailObj.ref}`)
			return Base64.decode(body).replace(/<td>|<\/td>|<tr>|<\/tr>|<BR>/g, ' ')
		},
		patternPicker: function (mailObj) {
			if (mailObj.body.includes('รับเงินผ่านรายการพร้อมเพย์')) return this.patterns.deposit_promptpay
			if (mailObj.body.includes('ชำระค่าสินค้าและบริการ')) return this.patterns.withdrawal
			if (mailObj.body.includes('โอนเงินพร้อมเพย์')) return this.patterns.withdrawal_promptpay
			if (mailObj.body.includes('เติมเงินพร้อมเพย์')) return this.patterns.withdrawal_ewallet
			if (mailObj.body.includes('เติมเงิน')) return this.patterns.withdrawal_topup
			if (mailObj.body.includes('โอนเงินไปธนาคารอื่น') || mailObj.body.includes('โอนเงินบัญชีบุคคลอื่นใน SCB')) return this.patterns.withdrawal_scb
			throw new Error(`Subject not supported - sender: ${mailObj.From}, subject: ${mailObj.Subject}, link:${mailObj.url}, ref:${mailObj.ref}`)
		},
		patterns: {
			deposit_promptpay: {
				regexs: {
					opposing_provider: { regex: compilePattern('จาก: ([^\\s]+) / x+[0-9]{4}'), parse: parser.none },
					opposing_account: { regex: compilePattern('จาก: [^\\s]+ / (x+[0-9]{4})'), parse: parser.none },
					account: { regex: compilePattern('เข้าบัญชี: (x+[0-9]{4})'), parse: parser.none },
					amount: { regex: compilePattern('จำนวน \\(บาท\\): ([0-9,.-]+)'), parse: parser.credit },
					date: { regex: compilePattern('วัน/เวลา: ([0-9]{1,2}.+[0-9]{4}) - ([0-9]{1,2}:[0-9]{2})'), parse: parser.thaiDateToISO }
				},
				extras: {
					type: 'deposit',
					provider: 'SCB'
				}
			},
			withdrawal: {
				regexs: {
					...commonPattern,
					opposing_account: { regex: compilePattern('ไปยัง ผู้ให้บริการ เบอร์บัญชี ([0-9]+)'), parse: parser.none },
				},
				extras: {
					type: 'withdrawal',
					provider: 'SCB'
				}
			},
			withdrawal_promptpay: {
				regexs: {
					...commonPattern,
					opposing_account: { regex: compilePattern('ไปยัง หมายเลขพร้อมเพย์ผู้รับเงิน ([0-9]+)'), parse: parser.none },
				},
				extras: {
					type: 'withdrawal',
					provider: 'SCB',
					opposing_provider: 'PromptPay'
				}
			},
			withdrawal_ewallet: {
				regexs: {
					...commonPattern,
					opposing_account: { regex: compilePattern('e-Wallet ID ([0-9]+)'), parse: parser.none },
				},
				extras: {
					type: 'withdrawal',
					provider: 'SCB',
					opposing_provider: 'e-Wallet'
				}
			},
			withdrawal_scb: {
				regexs: {
					...commonPattern,
					opposing_account: { regex: compilePattern('ไปยัง [^\\s0-9]+ เบอร์บัญชี ([0-9]+)'), parse: parser.none },
				},
				extras: {
					type: 'withdrawal',
					provider: 'SCB',
					opposing_provider: 'SCB'
				}
			},
			withdrawal_topup: {
				regexs: {
					...commonPattern,
					opposing_provider: { regex: compilePattern('ไปยัง ([^\\s]+)'), parse: parser.none },
					opposing_account: { regex: compilePattern('หมายเลขโทรศัพท์/หมายเลขอ้างอิง ([0-9]+)'), parse: parser.none },
				},
				extras: {
					type: 'withdrawal',
					provider: 'SCB'
				}
			}
		},
	}
}
