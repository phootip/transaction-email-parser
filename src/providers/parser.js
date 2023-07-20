import moment from 'moment';

export const parser = {
	none: (text) => text,
	addName: (name) => (text) => name + ' ' + text,
	amount: (text) => parseFloat(text.replace(',', '')),
	credit: (text) => parseFloat(text.replace(',', '')),
	debit: (text) => -parseFloat(text.replace(',', '')),
	dmyDateToISO: (text) => moment(text, 'DD/MM/YYYY hh:mm:ss').toDate(),
	thaiDateToISO: (thaiDate) => {
		var monthNamesThai = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
		var monthNamesEng = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
		thaiDate = thaiDate.split(' ')
		let idx = monthNamesThai.indexOf(thaiDate[1])
		let engDate = thaiDate
		engDate[2] = parseInt(thaiDate[2]) - 543
		engDate[1] = monthNamesEng[idx]
		// engDate.splice(3, 1)
		return moment(engDate.join(' '), 'DD MMM YYYY hh:mm:ss').toDate()
	},
}

export const compilePattern = (pattern) => {
	return new RegExp(pattern.split(/\s+/).join('\\s*'))
}
