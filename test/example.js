import MailParser from '../src/index.js'

async function main() {
	const mailParser = MailParser()
	// or set custom token/credential path
	// const mailParser = MailParser({{TOKEN_PATH:'/custom/path/token.json', CREDENTIALS_PATH:'/custom/path/credentials.json}})

	// const params = { q: `label:money-transaction` }
	const params = { q: `k plus` }
	const ids = await mailParser.listMailIds(params)
	const transactions = []
	for (const [i, id] of ids.entries()) {
		if (i>10) break
		const mail = await mailParser.readMail(id)
		try {
			transactions.push(mailParser.mailToTransaction(mail))
		} catch(e) {
			console.log(e.message)
		}
}


	const csvText = mailParser.toCSV(transactions)
	// or csv with selected headers
	// const csvText = mailParser.toCSV(transactions,['provider','account','date'])
	console.log(csvText)
}

main()
