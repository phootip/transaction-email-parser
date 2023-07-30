const config = {
	TOKEN_PATH: 'credentials/token.json',
	CREDENTIALS_PATH: 'credentials/credentials.json',
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
