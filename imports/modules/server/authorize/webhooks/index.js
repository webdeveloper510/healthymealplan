import { Meteor } from 'meteor/meteor';

import { Picker } from 'meteor/meteorhacks:picker';
import bodyParser from 'body-parser';

import Jobs from '../../../../api/Jobs/Jobs';

Picker.middleware(bodyParser.json());
Picker.middleware(bodyParser.urlencoded({ extended: false }));

Picker.route('/authorize/webhooks/', (params, request, response, next) => {
  const data = {
    params,
    query: params.query,
    body: request.body,
  };

  console.log('body from authorize request');

  console.log('Transaction id is: ' + data.body.payload.id);

  if (data.body.eventType == 'net.authorize.payment.authcapture.created') {
    const job = new Job(
      Jobs,
      'setSubscriptionActiveCard', // type of job
      {
        id: data.body.payload.id,
      },
    );

    job.priority('normal').save(); // Commit it to the server
  }

  response.statusCode = 200;
  response.end('Ok');
});
