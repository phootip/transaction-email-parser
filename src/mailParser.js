import { Base64 } from 'js-base64';
import dayjs from 'dayjs';

import {parser} from './providers/parser.js'
import providers from './providers/index.js'

export function mailToTransaction(mail) {
	let mailObj = headerTokenizer(mail)
	let provider = providers[mailObj.From]
	mailObj.body = provider.bodyExtractor(mail, mailObj)
	let patternMapping = provider.patternPicker(mailObj)

	const output = { ...patternMapping.extras }
	for (const [key, pattern] of Object.entries(patternMapping.regexs)) {
		const values = pattern.regex.exec(mailObj.body)
		if (!values && pattern.optional === true) continue
		if (!values) throw new Error(`regex exec return nothing, key:${key} - sender: ${mailObj.From}, subject: ${mailObj.Subject}, link:${mailObj.url}, ref:${mailObj.ref}`)
		const valuesString = values.slice(1).join(' ')
		output[key] = pattern.parse(valuesString)
	}
	output.url = mailObj.url
	output.id = mailObj.id
	if(!('date' in output)) {
		output.date = parser.mailDate(mailObj.Date)
	}
	return output
}

function headerTokenizer(mail) {
	let output = {
		snippet: mail.data.snippet,
		threadId: mail.data.threadId,
	}
	for (const header of mail.data.payload.headers) {
		if (header.name === 'From') output.From = header.value
		if (header.name === 'Subject') output.Subject = header.value
		if (header.name === 'Message-ID' || header.name === 'Message-Id') output.id = header.value
		if (header.name === 'Date') output.Date = header.value
	}
	if (!(output.From in providers)) throw new Error(`Sender not supported - ${output.From}`)
	output.url = `https://mail.google.com/mail/#inbox/${output.threadId}`
	output.ref = `rfc822msgid:${output.id}`
	return output
}

const default_headers = [	"type", "provider", "account", "opposing_provider", "opposing_account", "amount", "date", "id", "url"]
export function toCSV(mails, headers=default_headers) {
	const array = [headers].concat(mails.map(obj => {
		const output = []
		for (const key of headers) {
			if (key === 'date') output.push(dayjs(obj[key]).format())
			else if (!(key in obj)) output.push('')
			else output.push(obj[key].toString())
		}
		return output
	}))

	return array.map(x => {
		return x.join(',')
	}).join('\n')
}
