import { parser, compilePattern, commonRegex } from './parser.js'
import { Base64 } from 'js-base64';

const commonPattern = {
	account: { regex: compilePattern('จาก ธนาคารไทยพาณิชย์ เบอร์บัญชี (x+[0-9]{4})'), parse: parser.none },
	amount: { regex: compilePattern(`จำนวนเงิน ${commonRegex.amount} บาท`), parse: parser.debit },
	date: { regex: compilePattern(`วันและเวลาการทำรายการ: ${commonRegex.thaiDate} ณ ${commonRegex.hms}`), parse: parser.thaiDateToISO }
}

export default {
	'SCB Easy <scbeasynet@scb.co.th>': {
		altName: ['scbeasynet@scb.co.th'],
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
					amount: { regex: compilePattern(`จำนวน \\(บาท\\): ${commonRegex.amount}`), parse: parser.credit },
					date: { regex: compilePattern(`วัน/เวลา: ${commonRegex.thaiDate} - ${commonRegex.hm}`), parse: parser.thaiDateToISO }
				},
				extras: {
					type: 'deposit',
					provider: 'SCB'
				}
			},
			withdrawal: {
				regexs: {
					...commonPattern,
					opposing_account: { regex: compilePattern(`ไปยัง ผู้ให้บริการ เบอร์บัญชี ${commonRegex.number}`), parse: parser.none },
				},
				extras: {
					type: 'withdrawal',
					provider: 'SCB'
				}
			},
			withdrawal_promptpay: {
				regexs: {
					...commonPattern,
					opposing_account: { regex: compilePattern(`ไปยัง หมายเลขพร้อมเพย์ผู้รับเงิน ${commonRegex.number}`), parse: parser.none },
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
					opposing_account: { regex: compilePattern(`e-Wallet ID ${commonRegex.number}`), parse: parser.none },
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
					opposing_account: { regex: compilePattern(`ไปยัง [^\\s0-9]+ เบอร์บัญชี ${commonRegex.number}`), parse: parser.none },
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
					opposing_account: { regex: compilePattern(`หมายเลขโทรศัพท์/หมายเลขอ้างอิง ${commonRegex.number}`), parse: parser.none },
				},
				extras: {
					type: 'withdrawal',
					provider: 'SCB'
				}
			}
		},
	}
}
