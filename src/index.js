export * from './mailParser.js'
export * from './gmail.js'

import * as mailParser from './mailParser.js'
import * as gmail from './gmail.js'

export default (params) => {
	if (params) {
		gmail.setCredentialsPath(params.CREDENTIALS_PATH)
		gmail.setTokenPath(params.TOKEN_PATH)
	}

	return {
		...mailParser,
		...gmail
	}
}
