export * from './mailParser.js'
export * from './gmail.js'

import * as mailParser from './mailParser.js'
import * as gmail from './gmail.js'
import { setConfig } from './config.js'

const readAndParseMails = async (params) => {
	// params: {q: `label:money-transaction k plus` }
	let output = []
	let mails = await gmail.listMailIds(params)
	for (const [i, id] of mails.entries()) {
		let mail = await gmail.readMail(id)
		try {
			output.push(mailParser.mailToTransaction(mail))
		} catch (e) {
			if (e.message.includes('แจ้งเตือนการเข้าสู่ระบบ')) {
				console.log('skip login-notification email')
				continue
			}
			if (e.message.includes('new Terms')) {
				console.log('skip Term and Service email')
				continue
			}
			console.log(e)
		}
	}
	return output
}

export default (params) => {
	setConfig(params)

	return {
		...mailParser,
		...gmail,
		readAndParseMails
	}
}
