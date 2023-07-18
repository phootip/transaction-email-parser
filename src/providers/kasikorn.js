import { parser, compilePattern } from './parser.js'
import { Base64 } from 'js-base64';

export default {
	'K PLUS <KPLUS@kasikornbank.com>': {
		bodyExtractor: (mail, mailObj) => {
			const body = mail.data.payload.body.data
			if (!body) throw new Error(`bodyExtractor Failed - sender: ${mailObj.From}, subject: ${mailObj.Subject}, link:${mailObj.url}`)
			return Base64.decode(body)
		},
		patternPicker: function (mailObj) {
			if (mailObj.body.includes('Result of Funds Transfer')) return this.patterns.transfer
			if (mailObj.body.includes('Result of PromptPay Funds Transfer')) return this.patterns.transfer_promptpay
			if (mailObj.Subject.includes('Result of Bill Payment')) return this.patterns.bill_payment
			throw new Error(`Subject not supported - sender: ${mailObj.From}, subject: ${mailObj.Subject}, link:${mailObj.url}`)
		},
		patterns: {
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
					date: { regex: compilePattern('Transaction Date: ([0-9]{1,2}/[0-9]{2}/[0-9]{4}) ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: parser.dmyDateToISO }
				},
				extras: {
					type: 'transfer',
					source_provider: 'Kasikorn'
				}
			},
			transfer_promptpay: {
				regexs: {
					source: { regex: compilePattern('From Account: ([x\\-0-9]+)'), parse: parser.none },
					destination: { regex: compilePattern('To PromptPay|Wallet ID: ([x\\-0-9]+)'), parse: parser.none },
					destination_name: { regex: compilePattern('Received|Wallet Name: (.+)'), parse: parser.none },
					amount: { regex: compilePattern('Amount \\(THB\\): ([0-9,.-]+)'), parse: parser.amount },
					fee: { regex: compilePattern('Fee \\(THB\\): ([0-9,.-]+)'), parse: parser.amount },
					available_balance: { regex: compilePattern('Available Balance \\(THB\\): ([0-9,.-]+)'), parse: parser.amount },
					transaction_id: { regex: compilePattern('Transaction Number: (.+)'), parse: parser.none },
					date: { regex: compilePattern('Transaction Date: ([0-9]{1,2}/[0-9]{2}/[0-9]{4}) ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: parser.dmyDateToISO }
				},
				extras: {
					type: 'transfer',
					source_provider: 'Kasikorn',
					destination_provider: 'Promptpay'
				}
			},
			bill_payment: {
				regexs: {
					source: { regex: compilePattern('Paid From Account: ([x\\-0-9]+)'), parse: parser.none },
					destination: { regex: compilePattern('MerchantID : (.+)'), parse: parser.none, optional: true },
					destination_name: { regex: compilePattern('Company Name: (.+)'), parse: parser.none },
					amount: { regex: compilePattern('Amount \\(THB\\): ([0-9,.-]+)'), parse: parser.amount },
					fee: { regex: compilePattern('Fee \\(THB\\): ([0-9,.-]+)'), parse: parser.amount },
					available_balance: { regex: compilePattern('Available Balance \\(THB\\): ([0-9,.-]+)'), parse: parser.amount },
					transaction_id: { regex: compilePattern('Transaction Number: (.+)'), parse: parser.none },
					date: { regex: compilePattern('Transaction Date: ([0-9]{1,2}/[0-9]{2}/[0-9]{4}) ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: parser.dmyDateToISO }
				},
				extras: {
					type: 'payment',
					source_provider: 'Kasikorn',
				}
			}
		},
	}
}