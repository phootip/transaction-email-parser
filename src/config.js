import * as path from 'path'
const config = {
	TOKEN_PATH: path.join(process.cwd(), 'credentials/token.json'),
	CREDENTIALS_PATH: path.join(process.cwd(), 'credentials/credentials.json'),
	PUBSUB_TOPIC: '',
	PUBSUB_SUB: ''
}

export function setConfig(newConfig) {
	if(!newConfig) return
	for (const key of Object.keys(config)) {
		if (key in newConfig) {
			config[key] = newConfig[key]
		}
	}
}

export default config
