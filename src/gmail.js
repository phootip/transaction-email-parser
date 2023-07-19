import * as process from 'process';
import * as path from 'path';
import * as fs from 'fs/promises';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import config from './config.js';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
var Gmail = null;

async function loadSavedCredentialsIfExist() {
	try {
		const content = await fs.readFile(config.TOKEN_PATH);
		const credentials = JSON.parse(content);
		return google.auth.fromJSON(credentials);
	} catch (err) {
		return null;
	}
}

async function saveCredentials(client) {
	const content = await fs.readFile(config.CREDENTIALS_PATH);
	const keys = JSON.parse(content);
	const key = keys.installed || keys.web;
	const payload = JSON.stringify({
		type: 'authorized_user',
		client_id: key.client_id,
		client_secret: key.client_secret,
		refresh_token: client.credentials.refresh_token,
	});
	await fs.writeFile(config.TOKEN_PATH, payload);
}

async function authorize() {
	let client = await loadSavedCredentialsIfExist();
	if (client) {
		return client;
	}
	client = await authenticate({
		scopes: SCOPES,
		keyfilePath: config.CREDENTIALS_PATH,
	});
	if (client.credentials) {
		await saveCredentials(client);
	}
	return client;
}

async function getGmail() {
	if (Gmail !== null) return Gmail
	let auth = await authorize()
	Gmail = google.gmail({ version: 'v1', auth })
	return Gmail
}

async function saveObject(filename, obj) {
	const payload = JSON.stringify(obj)
	await fs.writeFile(`./tmp/${filename}.json`, payload)
}

export async function listLabels() {
	const gmail = await getGmail()
	const res = await gmail.users.labels.list({ userId: 'me', });
	const labels = res.data.labels;
	console.log(labels)
	await saveObject('labels', labels)
}

export async function listMailIds(params) {
	const gmail = await getGmail()
	const res = await gmail.users.messages.list({ userId: 'me', ...params })
	if (!(res.data.messages)) throw new Error(`no mail found with params: ${params}`)
	return res.data.messages.map(x => x.id)
}

export async function readMail(id) {
	const gmail = await getGmail()
	const res = await gmail.users.messages.get({ userId: 'me', id })
	return res
	// await saveObject('mails3',res2)
}

async function historyList() {
	const gmail = await getGmail()
	const res = await gmail.users.history.list({ userId: 'me' })
	await saveObject('history', res)
}

export async function watcher() {
	const gmail = await getGmail()
	let request = {
		'labelIds': ['INBOX'],
		'topicName': config.PUBSUB_TOPIC,
		'labelFilterBehavior': 'INCLUDE'
	}
	const res = await gmail.users.watch({userId:'me', ...request})
	console.log(res)
}

// await readMails()
// await listLabels()
// historyList()
