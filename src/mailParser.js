import * as fs from 'fs';
import { content_v2_1 } from 'googleapis';
import { Base64 } from 'js-base64';
import escapeStringRegexp from 'escape-string-regexp';
import { exit } from 'process';
import { threadId } from 'worker_threads';

import patterns from './patterns/index.js'

export function mailToTransaction(mail) {
	let mailObj = headerTokenizer(mail)
	let patternMapping
	switch (mailObj.From) {
		case 'SCB Easy <scbeasynet@scb.co.th>':
			mailObj.body = scbBodyExtractor(mail)
			patternMapping = scbPatternPicker(mailObj)
			break;
		case 'K PLUS <KPLUS@kasikornbank.com>':
			mailObj.body = defaultBodyExtractor(mail)
			patternMapping = kbankPatternPicker(mailObj)
			break;
		case '<AISeBill@billing.ais.co.th>':
			mailObj.body = aisBodyExtractor(mail)
			patternMapping = patterns[mailObj.From]['bill']
			// fs.writeFileSync(`./tmp/testcase/kbank/body1.json`, JSON.stringify(mailObj))
	}
	const output = { ...patternMapping.extras }
	for (const [key, pattern] of Object.entries(patternMapping.regexs)) {
		const values = pattern.regex.exec(mailObj.body)
		if (!values) continue
		const valuesString = values.slice(1).join(' ')
		output[key] = pattern.parse(valuesString)
	}
	output.url = mailObj.url
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
	}
	if (!(output.From in patterns)) throw new Error(`Sender not supported - ${output.From}`)
	output.url = `https://mail.google.com/mail/#inbox/${output.threadId}`
	return output
}

function defaultBodyExtractor(mail) {
	let body = mail.data.payload.body.data
	body = Base64.decode(body)
	return body
}

function scbBodyExtractor(mail) {
	let body = mail.data.payload.parts[0].parts[0].body.data
	body = Base64.decode(body).replace(/<td>|<\/td>|<tr>|<\/tr>|<BR>/g, ' ')
	return body
}

function aisBodyExtractor(mail) {
	let body = mail.data.payload.parts[0].body.data
	body = Base64.decode(body).replace(/<[^>]*>|&nbsp;/g, ' ')
	return body
}

function scbPatternPicker(mailObj) {
	if (mailObj.body.includes('รับเงินผ่านรายการพร้อมเพย์')) return patterns[mailObj.From]['deposit_promptpay']
	if (mailObj.body.includes('ชำระค่าสินค้าและบริการ')) return patterns[mailObj.From]['payment']
	if (mailObj.body.includes('โอนเงินพร้อมเพย์')) return patterns[mailObj.From]['payment_promptpay']
	if (mailObj.body.includes('เติมเงินพร้อมเพย์')) return patterns[mailObj.From]['payment_ewallet']
	if (mailObj.body.includes('โอนเงินไปธนาคารอื่น')) return patterns[mailObj.From]['transfer']
	throw new Error(`Subject not supported - sender: ${mailObj.From}, subject: ${mailObj.Subject}, link:${mailObj.url}`)
}

function kbankPatternPicker(mailObj) {
	if (mailObj.body.includes('Result of Funds Transfer (Success)')) return patterns[mailObj.From]['transfer']
}
