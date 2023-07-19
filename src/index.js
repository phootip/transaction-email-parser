export * from './mailParser.js'
export * from './gmail.js'

import * as mailParser from './mailParser.js'
import * as gmail from './gmail.js'
import { setConfig } from './config.js'

export default (params) => {
	setConfig(params)

	return {
		...mailParser,
		...gmail
	}
}
