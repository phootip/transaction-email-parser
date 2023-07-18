import { parser, compilePattern } from './parser.js'
import { Base64 } from 'js-base64';

export default {
	'<AISeBill@billing.ais.co.th>': {
		bodyExtractor: (mail) => {
			const body = mail.data.payload.parts[0].body.data
			return Base64.decode(body).replace(/<[^>]*>|&nbsp;/g, ' ')
		},
		patternPicker: function() { return this.patterns.bill },
		patterns: {
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
}
