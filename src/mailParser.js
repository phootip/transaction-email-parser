import * as fs from 'fs';
import { content_v2_1 } from 'googleapis';
import { Base64 } from 'js-base64';
import escapeStringRegexp from 'escape-string-regexp';
import { exit } from 'process';
import { threadId } from 'worker_threads';

import providers from './providers/index.js'

export function mailToTransaction(mail) {
	let mailObj = headerTokenizer(mail)
	let provider = providers[mailObj.From]
	mailObj.body = provider.bodyExtractor(mail, mailObj)
	// fs.writeFileSync(`./tmp/testcase/kkp/body.json`, mailObj.body)
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
	// output.ref = mailObj.ref
	output.id = mailObj.id
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
	}
	if (!(output.From in providers)) throw new Error(`Sender not supported - ${output.From}`)
	output.url = `https://mail.google.com/mail/#inbox/${output.threadId}`
	output.ref = `rfc822msgid:${output.id}`
	return output
}



function kbankPatternPicker(mailObj) {
	if (mailObj.body.includes('Result of Funds Transfer (Success)')) return providers[mailObj.From]['transfer']
}
