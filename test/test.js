import escapeStringRegexp from 'escape-string-regexp'

const placeholderMatchers = {
  string: {
    regexp: `.+?`,
    process: matchedText => matchedText
  },
  number: {
    regexp: `[0-9,.-]+`,
    process: matchedText => parseFloat(matchedText.replace(/,/g, '')).toFixed(2)
  },
  kbank_date: {
    regexp: `\\d\\d\\/\\d\\d\\/\\d\\d`,
    process: matchedText => {
      const [a, b, c] = matchedText.split('/')
      return `20${c}-${b}-${a}`
    }
  },
  time: {
    regexp: `\\d\\d?:\\d\\d`,
    process: matchedText => (matchedText.length < 5 ? '0' : '') + matchedText
  }
};

(() => {
	let pattern = 'ชำระเงิน {{amount:number}}บ. ให้ {{to}} คงเหลือ {{balance:number}}บ. ({{transactionId}})'
	let regexpParts = []
	let matchParts = []
	pattern.split(/\{\{(\w+(?::\w+)?)\}\}/).forEach((part, i) => {
    if (i % 2 === 0) {
      regexpParts.push(
        part
          .split(/\s+/)
          .map(x => escapeStringRegexp(x))
          .join(`\\s*`)
      )
    } else {
      const subparts = part.split(':')
      const key = subparts[0]
      const matcherName = subparts[1] || 'string'
      const matcher = placeholderMatchers[matcherName]
      regexpParts.push(`(${matcher.regexp})`)
      matchParts.push({ key, matcher })
    }
  })
	console.log(regexpParts)
	console.log(`^\\s*${regexpParts.join('')}\\s*$`)
  const regexp = new RegExp(`^\\s*${regexpParts.join('')}\\s*$`, 'i')
	let a = regexp.exec('ชำระเงิน 50.00บ. ให้ 7-ELEVEN คงเหลือ 1,234.56บ. (1234567890123)')
	console.log(a)

})();
