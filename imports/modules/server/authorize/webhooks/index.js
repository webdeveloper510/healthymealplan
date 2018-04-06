import { Meteor } from 'meteor/meteor';

import { Picker } from 'meteor/meteorhacks:picker';
import bodyParser from 'body-parser';

import Jobs from '../../../../api/Jobs/Jobs';

import getTransactionDetails from '../getTransactionDetails';

Picker.middleware(bodyParser.json());
Picker.middleware(bodyParser.urlencoded({ extended: false }));

Picker.route('/authorize/webhooks/', (params, request, response, next) => {
  const data = {
    params,
    query: params.query,
    body: request.body,
  };

  if (data.body.eventType === 'net.authorize.payment.authcapture.created') {
    console.log('Body from Authorize Webhook');
    console.log('Authorize Payment AuthCapture Created');
    console.log(`Transaction ID is: ${data.body.payload.id}`);

    const syncGetTransactionDetails = Meteor.wrapAsync(getTransactionDetails);
    const transaction = syncGetTransactionDetails(data.body.payload.id);

    console.log(transaction);

    if (transaction.transaction.hasOwnProperty('customer') && transaction.transaction.customer.hasOwnProperty('id')) {
      const job = new Job(
        Jobs,
        'setSubscriptionActiveCard', // type of job
        {
          id: data.body.payload.id,
        },
      );
      job.priority('normal').save(); // Commit it to the server  

    } else {
      console.log('no customer or no property id');
    }

  }

  response.statusCode = 200;
  response.end('Ok');
});
