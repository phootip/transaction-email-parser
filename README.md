# transaction-email-parser
Parse transaction mail information into json object, craft your account statement from history of emails. Use together with gmail API, have build-in gmail library for trying out and taking a quick look at the output

# Installation
```npm install transaction-email-parser```

# Prerequisites
Requires google credentials, [link](https://developers.google.com/gmail/api/quickstart/nodejs#authorize_credentials_for_a_desktop_application). Put credentials.json file to `./credentials/credentails.json`
# API
```
import MailParser from 'transaction-email-parser'

const mailParser = MailParser()
// or set custom token/credential path
const mailParser = MailParser({{TOKEN_PATH:'/custom/path/token.json', CREDENTIALS_PATH:'/custom/path/credentials.json}})

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
```

```
// Example: mail 

// Dear Customer of mobile number 08-XXXX-1234
// Subject: Result of PromptPay Funds Transfer (Success)

// With reference to your request for funds transfer via K PLUS Service as follows:

//         Transaction Date: 11/07/2023  11:22:33
//         Transaction Number: 111111111111ABA22222
//         From Account: xxx-x-x4321-x
//         To PromptPay ID: xxx-xxx-1234
//         Received Name: MR. AAA BBBBB
//         Amount (THB): 3.00
//         Fee (THB): 0.00
//         Available Balance (THB): 2,333.00

// output: mailToTransaction(mail)
[
  {
    type: 'withdrawal',
    provider: 'Kasikorn',
    opposing_provider: 'Promptpay',
    account: 'xxx-x-x4321-x',
    opposing_account: 'xxx-xxx-1234',
    opposing_account_name: 'MR. AAA BBBBB',
    amount: -3,
    fee: -0,
    available_balance: 2333,
    transaction_id: '111111111111ABA22222',
    date: 2023-07-11T11:22:33.000Z,
    url: 'https://mail.google.com/mail/#inbox/555555abc55de555',
    id: '<22222EFG2222.ABC333333333@something-something>'
  },
]
```
note that id can be use to search on gmail webpage with `rfc822msgid:{id}`

# Support Provider
We only support Thai Bank right now, if you want a new providers to be add, sent me an email sample or open a PR to add them
- AIS
- Kasikorn
- KKP: Kiatnakin Phatra Bank
- KTC: Krungthai Card
- SCB: Siam Commercial Bank
