import * as process from 'process';
import * as path from 'path';
import * as fs from 'fs/promises';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
// import { gmail } from 'googleapis/build/src/apis/gmail';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'credentials/token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials/credentials.json');
var Gmail = null;

async function loadSavedCredentialsIfExist() {
	try {
		const content = await fs.readFile(TOKEN_PATH);
		const credentials = JSON.parse(content);
		return google.auth.fromJSON(credentials);
	} catch (err) {
		return null;
	}
}

async function saveCredentials(client) {
	const content = await fs.readFile(CREDENTIALS_PATH);
	const keys = JSON.parse(content);
	const key = keys.installed || keys.web;
	const payload = JSON.stringify({
		type: 'authorized_user',
		client_id: key.client_id,
		client_secret: key.client_secret,
		refresh_token: client.credentials.refresh_token,
	});
	await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
	let client = await loadSavedCredentialsIfExist();
	if (client) {
		return client;
	}
	client = await authenticate({
		scopes: SCOPES,
		keyfilePath: CREDENTIALS_PATH,
	});
	// console.log(client)
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

async function listLabels() {
	const gmail = await getGmail()
	const res = await gmail.users.labels.list({ userId: 'me', });
	const labels = res.data.labels;
	await saveObject('labels', labels)
}

export async function listMailIds(labelIds) {
	const gmail = await getGmail()
	const res = await gmail.users.messages.list({ userId: 'me', labelIds })
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
		'topicName': 'projects/budget-tracker-392713/topics/gmail',
		'labelFilterBehavior': 'INCLUDE'
	}
	const res = await gmail.users.watch({userId:'me', ...request})
	console.log(res)
}

// await readMails()
// await listLabels()
// historyList()
