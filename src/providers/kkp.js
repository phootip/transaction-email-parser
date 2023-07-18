import { parser, compilePattern } from './parser.js'
import { Base64 } from 'js-base64';

export default {
	'Kiatnakin Phatra Bank <no-reply@kkpfg.com>': {
		bodyExtractor: (mail, mailObj) => {
			const body = mail.data.payload.body.data
			if (!body) throw new Error(`bodyExtractor Failed - sender: ${mailObj.From}, subject: ${mailObj.Subject}, link:${mailObj.url}, ref:${mailObj.ref}`)
			return Base64.decode(body)
		},
		patternPicker: function (mailObj) {
			if (mailObj.body.includes('Result of Funds Transfer')) return this.patterns.transfer
			if (mailObj.body.includes('Result of receiving Funds Transfer')) return this.patterns.deposit
			throw new Error(`Subject not supported - sender: ${mailObj.From}, subject: ${mailObj.Subject}, link:${mailObj.url}, ref:${mailObj.ref}`)
		},
		patterns: {
			transfer: {
				regexs: {
					source: { regex: compilePattern('From Account : ([Xx\\-0-9]+)'), parse: parser.none },
					amount: { regex: compilePattern('Amount \\(THB\\) : ([0-9,.-]+)'), parse: parser.amount },
					date: { regex: compilePattern('Transaction date : ([0-9]{1,2}/[0-9]{2}/[0-9]{4}) - ([0-9]{1,2}:[0-9]{2})'), parse: parser.dmyDateToISO }
				},
				extras: {
					type: 'transfer',
					source_provider: 'KKP'
				}
			},
			deposit: {
				regexs: {
					destination: { regex: compilePattern('Into account : ([Xx\\-0-9]+)'), parse: parser.none },
					amount: { regex: compilePattern('Amount \\(THB\\) : ([0-9,.-]+)'), parse: parser.amount },
					date: { regex: compilePattern('Transaction date : ([0-9]{1,2}/[0-9]{2}/[0-9]{4}) - ([0-9]{1,2}:[0-9]{2})'), parse: parser.dmyDateToISO }
				},
				extras: {
					type: 'deposit',
					source_provider: 'KKP'
				}
			},
		},
	}
}
