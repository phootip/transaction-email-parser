import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
dayjs.extend(customParseFormat)

export const parser = {
	none: (text) => text.trim(),
	addName: (name) => (text) => name + ' ' + text.trim(),
	url: (id) => `https://mail.google.com/mail/#inbox/${id}`,
	amount: (text) => parseFloat(text.trim().replace(',', '')),
	credit: (text) => parseFloat(text.trim().replace(',', '')),
	debit: (text) => -parseFloat(text.trim().replace(',', '')),
	dmyhmsToISO: (text) => dayjs(text.trim(), 'DD/MM/YYYY hh:mm:ss').toDate(),
	dmyhmToISO: (text) => dayjs(text.trim(), 'DD/MM/YYYY hh:mm').toDate(),
	thaiDateToISO: (thaiDate) => {
		var monthNamesThai = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
		var monthNamesEng = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
		thaiDate = thaiDate.split(' ')
		let idx = monthNamesThai.indexOf(thaiDate[1])
		let engDate = thaiDate
		engDate[2] = parseInt(thaiDate[2]) - 543
		engDate[1] = monthNamesEng[idx]
		return dayjs(engDate.join(' '), ['D MMM YYYY hh:mm:ss','D MMM YYYY hh:mm']).toDate()
	},
	mailDate: (text) => dayjs(text, ['D MMM YYYY hh:mm:ss ZZ','ddd, D MMM YYYY hh:mm:ss']).toDate()
}

export const compilePattern = (pattern) => {
	return new RegExp(pattern.split(/\s+/).join('\\s*'))
}

export const commonRegex = {
	any: '(.+)',
	number: '([0-9]+)',
	amount: '([0-9,.-]+)',
	dmy: '([0-9]{1,2}/[0-9]{2}/[0-9]{4})',
	hms: '([0-9]{1,2}:[0-9]{2}:[0-9]{2})',
	hm: '([0-9]{1,2}:[0-9]{2})',
	thaiDate: '([0-9]{1,2}.+[0-9]{4})'
}
