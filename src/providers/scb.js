import { parser, compilePattern } from './parser.js'
import { Base64 } from 'js-base64';

export default {
	'SCB Easy <scbeasynet@scb.co.th>': {
		bodyExtractor: (mail) => {
			const body = mail.data.payload.parts[0].parts[0].body.data
			return Base64.decode(body).replace(/<td>|<\/td>|<tr>|<\/tr>|<BR>/g, ' ')
		},
		patternPicker: function (mailObj) {
			if (mailObj.body.includes('รับเงินผ่านรายการพร้อมเพย์')) return this.patterns.deposit_promptpay
			if (mailObj.body.includes('ชำระค่าสินค้าและบริการ')) return this.patterns.payment
			if (mailObj.body.includes('โอนเงินพร้อมเพย์')) return this.patterns.payment_promptpay
			if (mailObj.body.includes('เติมเงินพร้อมเพย์')) return this.patterns.payment_ewallet
			if (mailObj.body.includes('โอนเงินไปธนาคารอื่น')) return this.patterns.transfer
			throw new Error(`Subject not supported - sender: ${mailObj.From}, subject: ${mailObj.Subject}, link:${mailObj.url}`)
		},
		patterns: {
			deposit_promptpay: {
				regexs: {
					source_provider: { regex: compilePattern('จาก: ([^\\s]+) / x+[0-9]{4}'), parse: parser.none },
					source: { regex: compilePattern('จาก: [^\\s]+ / (x+[0-9]{4})'), parse: parser.none },
					destination: { regex: compilePattern('เข้าบัญชี: (x+[0-9]{4})'), parse: parser.none },
					amount: { regex: compilePattern('จำนวน \\(บาท\\): ([0-9,.-]+)'), parse: parser.amount },
					date: { regex: compilePattern('วัน/เวลา: ([0-9]{1,2}.+[0-9]{4}) - ([0-9]{1,2}:[0-9]{2})'), parse: parser.thaiDateToISO }
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
					date: { regex: compilePattern('วันและเวลาการทำรายการ: ([0-9]{1,2}.+[0-9]{4}) ณ ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: parser.thaiDateToISO }
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
					date: { regex: compilePattern('วันและเวลาการทำรายการ: ([0-9]{1,2}.+[0-9]{4}) ณ ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: parser.thaiDateToISO }
				},
				extras: {
					type: 'payment',
					source_provider: 'SCB',
					destination_provider: 'PromptPay'
				}
			},
			payment_ewallet: {
				regexs: {
					source: { regex: compilePattern('จาก ธนาคารไทยพาณิชย์ เบอร์บัญชี (x+[0-9]{4})'), parse: parser.none },
					destination: { regex: compilePattern('e-Wallet ID ([0-9]+)'), parse: parser.none },
					amount: { regex: compilePattern('จำนวนเงิน ([0-9,.-]+) บาท'), parse: parser.amount },
					date: { regex: compilePattern('วันและเวลาการทำรายการ: ([0-9]{1,2}.+[0-9]{4}) ณ ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: parser.thaiDateToISO }
				},
				extras: {
					type: 'payment',
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
					date: { regex: compilePattern('วันและเวลาการทำรายการ: ([0-9]{1,2}.+[0-9]{4}) ณ ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: parser.thaiDateToISO }
				},
				extras: {
					type: 'transfer',
					source_provider: 'SCB'
				}
			}
		},
	}
}
