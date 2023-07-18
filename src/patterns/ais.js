import {parser,compilePattern} from './parser.js'

export default {
	'<AISeBill@billing.ais.co.th>': {
		bill: {
			regexs: {
				amount: { regex: compilePattern('Total Current Charge ([1-9,.-]+) Baht'), parse: parser.amount },
			},
			extras: {
				type: 'bill',
				provider: 'AIS'
			}
		},
	}
}
