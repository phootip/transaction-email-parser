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

const ids = mailParser.listMailIds(params)
const mail = await gmail.readMail(ids)

const transactions = mailParser.mailToTransaction(mail)
// Example: Kasikorn 
// Dear Customer of mobile number 08-XXXX-1234
// Subject: Result of PromptPay Funds Transfer (Success)

// With reference to your request for funds transfer via K PLUS Service as follows:

//         Transaction Date: 23/07/2023  20:47:18
//         Transaction Number: 111111111111ABA22222
//         From Account: xxx-x-x4321-x
//         To PromptPay ID: xxx-xxx-1234
//         Received Name: MR. AAA BBBBB
//         Amount (THB): 3.00

// output:
 
const csvText = mailParser.toCSV(transactions)
// or csv with selected headers
const csvText = mailParser.toCSV(transactions,['provider','account','date'])
```

# Support Provider
We only support Thai Bank right now, if you want a new providers to be add, sent me an email sample or open a PR to add them
- AIS
- Kasikorn
- KKP: Kiatnakin Phatra Bank
- KTC: Krungthai Card
- SCB: Siam Commercial Bank
