import { parser, compilePattern, commonRegex } from './parser.js'

export default {
	legacyId: { regex: compilePattern('data-legacy-message-id="([0-9a-z]+)"'), parse: parser.none },
}
