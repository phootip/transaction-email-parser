import {parser, compilePattern} from './parser.js'
import aisPattern from './ais.js'

import scb from './scb.js'

export default {
	...scb,
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
				date: { regex: compilePattern('Transaction Date: ([0-9]{1,2}/[0-9]{2}/[0-9]{4}) ([0-9]{1,2}:[0-9]{2}:[0-9]{2})'), parse: parser.dmyDateToISO }
			},
			extras: {
				type: 'transfer',
				source_provider: 'Kasikorn'
			}
		}
	},
	...aisPattern
}
