import { parser, compilePattern } from './parser.js'
import { Base64 } from 'js-base64';

const commonPattern = {
	amount: { regex: compilePattern('Amount \\(THB\\): ([0-9,.-]+)'), parse: parser.debit },
	fee: { regex: compilePattern('Fee \\(THB\\): ([0-9,.-]+)'), parse: parser.debit },
	available_balance: { regex: compilePattern('Available Balance \\(THB\\): ([0-9,.-]+)'), parse: parser.amount },
	transaction_id: { regex: compilePattern('Transaction Number: (.+)'), parse: parser.none },
	date: { regex: compilePattern('Transaction Date: ([0-9]{1,2}/[0-9]{2}/[0-9]{4}) ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: parser.dmyhmsToISO }
}

export default {
	'K PLUS <KPLUS@kasikornbank.com>': {
		bodyExtractor: (mail, mailObj) => {
			const body = mail.data.payload.body.data
			if (!body) throw new Error(`bodyExtractor Failed - sender: ${mailObj.From}, subject: ${mailObj.Subject}, link:${mailObj.url}, ref:${mailObj.ref}`)
			return Base64.decode(body)
		},
		patternPicker: function (mailObj) {
			if (mailObj.body.includes('Result of Funds Transfer')) return this.patterns.withdrawal
			if (mailObj.body.includes('Result of PromptPay Funds Transfer')) return this.patterns.withdrawal_promptpay
			if (mailObj.Subject.includes('Result of Bill Payment')) return this.patterns.withdrawal_bill
			throw new Error(`Subject not supported - sender: ${mailObj.From}, subject: ${mailObj.Subject}, link:${mailObj.url}, ref:${mailObj.ref}`)
		},
		patterns: {
			withdrawal: {
				regexs: {
					account: { regex: compilePattern('From Account: ([x\\-0-9]+)'), parse: parser.none },
					opposing_account: { regex: compilePattern('To Account: ([\\-0-9]+)'), parse: parser.none },
					opposing_provider: { regex: compilePattern('To Bank: (.+)'), parse: parser.none },
					opposing_account_name: { regex: compilePattern('Account Name: (.+)'), parse: parser.none },
					...commonPattern
				},
				extras: {
					type: 'withdrawal',
					provider: 'Kasikorn'
				}
			},
			withdrawal_promptpay: {
				regexs: {
					account: { regex: compilePattern('From Account: ([x\\-0-9]+)'), parse: parser.none },
					opposing_account: { regex: compilePattern('To (?:PromptPay|Wallet) ID: ([x\\-0-9]+)'), parse: parser.none },
					opposing_account_name: { regex: compilePattern('(?:Received|Wallet) Name: (.+)'), parse: parser.none },
					...commonPattern
				},
				extras: {
					type: 'withdrawal',
					provider: 'Kasikorn',
					opposing_provider: 'Promptpay'
				}
			},
			withdrawal_bill: {
				regexs: {
					account: { regex: compilePattern('Paid From Account: ([x\\-0-9]+)'), parse: parser.none },
					opposing_account: { regex: compilePattern('MerchantID : (.+)'), parse: parser.none, optional: true },
					opposing_account_name: { regex: compilePattern('Company Name: (.+)'), parse: parser.none },
					...commonPattern
				},
				extras: {
					type: 'withdrawal',
					provider: 'Kasikorn',
					opposing_provider: 'Bill'
				}
			}
		},
	}
}
