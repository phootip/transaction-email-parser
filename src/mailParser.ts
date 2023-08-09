import { Base64 } from "js-base64";
import * as dayjs from 'dayjs'
import _ from "lodash";

import { parser } from "./providers/parser.js";
import providers from "./providers/index.js";
import textRegex from "./providers/text.js";
import { gmail, gmail_v1 } from "googleapis/build/src/apis/gmail/index.js";

export function mailToTransaction(mail: gmail_v1.Schema$Message) {
  let mailObj = headerTokenizer(mail);
  let provider = providers[mailObj.From];
  mailObj.body = provider.bodyExtractor(mail, mailObj);
  let patternMapping = provider.patternPicker(mailObj);

  const output = {
    ...patternMapping.extras,
    ...executeRegexs(patternMapping.regexs, mailObj.body),
    url: mailObj.url,
    id: mailObj.id,
    legacyId: mailObj.legacyId,
  }
  if (!("date" in output)) {
    output.date = parser.mailDate(mailObj.Date);
  }
  return output;
}

export function textToTransaction(text,legacyId) {
  let provider = null;
  for (const [sender, p] of Object.entries(providers)) {
    if (text.includes(sender) || _.some(p.altName, (el) => _.includes(text, el))) {
      provider = p;
      break;
    }
  }
  // text = text.replace('<wbr>','')
  const noHTMLtext = text.replace(/<[^>]*>|&nbsp;/g, '')
  const patternMapping = provider.patternPicker({ body: noHTMLtext });
  const output = {
    ...patternMapping.extras,
    ...executeRegexs(patternMapping.regexs, noHTMLtext),
    ...executeRegexs(textRegex, text),
    // legacyId,
    // url: `https://mail.google.com/mail/#inbox/${legacyId}`
  }
  output.url = `https://mail.google.com/mail/#inbox/${output.legacyId}`
  return output;
}

function executeRegexs(regexs, text) {
  const output = {}
  for (const [key, pattern] of Object.entries(regexs)) {
    const values = pattern.regex.exec(text);
    if (!values && pattern.optional === true) continue;
    if (!values) throw new Error(`regex exec return nothing, key:${key}`);
    const valuesString = values.slice(1).join(" ");
    output[key] = pattern.parse(valuesString);
  }
  return output
}

function headerTokenizer(mail) {
  let output = {
    snippet: mail.data.snippet,
    legacyId: mail.data.id,
  };
  for (const header of mail.data.payload.headers) {
    if (header.name === "From") output.From = header.value;
    if (header.name === "Subject") output.Subject = header.value;
    if (header.name === "Message-ID" || header.name === "Message-Id")
      output.id = header.value;
    if (header.name === "Date") output.Date = header.value;
  }
  if (!(output.From in providers))
    throw new Error(`Sender not supported - ${output.From}`);
  output.url = `https://mail.google.com/mail/#inbox/${output.legacyId}`;
  output.ref = `rfc822msgid:${output.id}`;
  return output;
}

const default_headers = [
  "type",
  "provider",
  "account",
  "opposing_provider",
  "opposing_account",
  "amount",
  "date",
  "id",
  "url",
];
export function toCSV(mails, headers = default_headers) {
  const array = [headers].concat(
    mails.map((obj) => {
      const output = [];
      for (const key of headers) {
        if (key === "date") output.push(dayjs(obj[key]).format());
        else if (!(key in obj)) output.push("");
        else output.push(obj[key].toString());
      }
      return output;
    })
  );

  return array
    .map((x) => {
      return x.join(",");
    })
    .join("\n");
}
