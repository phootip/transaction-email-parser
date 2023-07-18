import {parser, compilePattern} from './parser.js'

import aisProvider from './ais.js'
import scbProvider from './scb.js'
import kasikornProvider from './kasikorn.js'
import kkpProvider from './kkp.js'

export default {
	...scbProvider,
	...kasikornProvider,
	...aisProvider,
	...kkpProvider
}
