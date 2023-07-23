import aisProvider from './ais.js'
import scbProvider from './scb.js'
import kasikornProvider from './kasikorn.js'
import kkpProvider from './kkp.js'
import ktcProvider from './ktc.js'

export default {
	...scbProvider,
	...kasikornProvider,
	...aisProvider,
	...kkpProvider,
	...ktcProvider
}
