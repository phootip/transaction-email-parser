import dayjs from 'dayjs';

export const parser = {
	none: (text) => text.trim(),
	addName: (name) => (text) => name + ' ' + text.trim(),
	amount: (text) => parseFloat(text.trim().replace(',', '')),
	credit: (text) => parseFloat(text.trim().replace(',', '')),
	debit: (text) => -parseFloat(text.trim().replace(',', '')),
	dmyDateToISO: (text) => dayjs(text.trim(), 'DD/MM/YYYY hh:mm:ss').toDate(),
	thaiDateToISO: (thaiDate) => {
		var monthNamesThai = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
		var monthNamesEng = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
		thaiDate = thaiDate.split(' ')
		let idx = monthNamesThai.indexOf(thaiDate[1])
		let engDate = thaiDate
		engDate[2] = parseInt(thaiDate[2]) - 543
		engDate[1] = monthNamesEng[idx]
		// engDate.splice(3, 1)
		return dayjs(engDate.join(' '), 'DD MMM YYYY hh:mm:ss').toDate()
	},
	mailDate: (text) => dayjs(text, 'ddd, DD MMM YYYY hh:mm:ss').toDate()
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
