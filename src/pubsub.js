const subscriptionName = process.env.SUB_NAME;
console.log(process.env.SUB_NAME)
import { PubSub } from '@google-cloud/pubsub';
const pubSubClient = new PubSub();

export function listen() {
	const subscription = pubSubClient.subscription(subscriptionName)
	const timeout = 60
	let messageCount = 0;
  const messageHandler = message => {
    console.log(`Received message ${message.id}:`);
    console.log(`\tData: ${message.data}`);
    console.log(`\tAttributes: ${message.attributes}`);
    messageCount += 1;

    // "Ack" (acknowledge receipt of) the message
    message.ack();
  };
	subscription.on('message', messageHandler);
	setTimeout(() => {
    subscription.removeListener('message', messageHandler);
    console.log(`${messageCount} message(s) received.`);
  }, timeout * 1000);
}
