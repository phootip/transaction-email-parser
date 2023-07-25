# transaction-email-parser
Parse transaction mail information into json object, craft your account statement from history of emails. Use together with gmail API, have build-in gmail library for trying out and taking a quick look at the output

# Installation
```npm install transaction-email-parser```

# API
```
import MailParser from 'transaction-email-parser'
const mailParser = MailParser()
const ids = mailParser.listMailIds(params)

const transactions = mailParser.mailToTransaction(mail)
const csvText = mailParser.toCSV(transactions)
```
