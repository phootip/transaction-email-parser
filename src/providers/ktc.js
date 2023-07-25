import { parser, compilePattern, commonRegex } from './parser.js'
import { Base64 } from 'js-base64';

const commonPattern = {
}
export default {
	'Onlineservice@ktc.co.th': {
		bodyExtractor: (mail, mailObj) => {
			const body = mail.data.payload.parts[0].body.data
			if (!body) throw new Error(`bodyExtractor Failed - sender: ${mailObj.From}, subject: ${mailObj.Subject}, link:${mailObj.url}, ref:${mailObj.ref}`)
			return Base64.decode(body).replace(/<[^>]*>|&nbsp;/g, ' ')
		},
		patternPicker: function (mailObj) {
			if (mailObj.body.includes('online transaction via KTC')) return this.patterns.withdrawal
			if (mailObj.body.includes('KTC bill payment')) return this.patterns.deposit
			throw new Error(`Subject not supported - sender: ${mailObj.From}, subject: ${mailObj.Subject}, link:${mailObj.url}, ref:${mailObj.ref}`)
		},
		patterns: {
			withdrawal: {
				regexs: {
					account: { regex: compilePattern('KTC Credit Card Number: ([Xx\\-0-9]+)'), parse: parser.none },
					opposing_account: { regex: compilePattern(`Merchant Name: ${commonRegex.any}`), parse: parser.none },
					amount: { regex: compilePattern('Amount: ([0-9,.-]+) THB'), parse: parser.debit },
					// date
				},
				extras: {
					type: 'withdrawal',
					provider: 'KTC'
				}
			},
			deposit: {
				regexs: {
					account: { regex: compilePattern('Card no.: ([Xx\\s\\-0-9]+)'), parse: parser.none },
					opposing_account: { regex: compilePattern(`Account no.: ([\\*0-9]+) ([\\*0-9]+)`), parse: parser.none },
					amount: { regex: compilePattern('amount: ([0-9,.-]+) THB'), parse: parser.credit },
					date: { regex: compilePattern(`Transaction date: ${commonRegex.dmy} at ${commonRegex.hms} hrs.`), parse: parser.dmyhmsToISO }
				},
				extras: {
					type: 'deposit',
					provider: 'KTC'
				}
			},
		},
	}
}
