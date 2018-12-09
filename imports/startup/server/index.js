import './accounts';
import './api';
import './email';

import Jobs from '../../api/Jobs/Jobs';
// import Subscriptions from '../../api/Subscriptions/Subscriptions';


import './jobs';
import './jobs/setSubscriptionActive';
import './jobs/setSubscriptionActiveCard';
import './jobs/createInvoices';

import './jobs/setSubscriptionCancelledJob';
import './jobs/setSubscriptionActiveJob';
import './jobs/setSubscriptionCancelledCardJob';
import './jobs/setSubscriptionActiveCardJob';
import './jobs/editSubscriptionJob';
import './jobs/editSubscriptionJobNonCard';

import './jobs/enableDiscountJob';
import './jobs/disableDiscountJob';

import './jobs/sendFirstRecoveryEmailJob';

import '../../modules/server/authorize/webhooks/';

import './jobs/masterBillingJob';
import './jobs/slaveChargeJob';
// import calculateSubscriptionCost from '../../modules/server/billing/calculateSubscriptionCost';
// import createSubscriptionFromCustomerProfile from '../../modules/server/authorize/createSubscriptionFromCustomerProfile';

S3 = {};

S3.config = {
  key: 'AKIAJAJSCSTOP6PEVJZA',
  secret: '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',
  bucket: 'vittle-new',
};

// const cost = calculateSubscriptionCost({});

// Jobs.setLogStream(process.stdout);

// THIS IS TO BE USED IN AN EMERGENCY
// MANUAL SUBSCRIPTION EDIT CODE BELOW

// const restart = Jobs.restartJobs(['vQHrmWAY8ingroAm5']);

// console.log(restart);


// console.log(cost);

// Subscriptions.update({
//   customerId: 'tKmQ5BZSDsh5jLrJg',
// }, {
//   $set: {
//     amount: cost.actualTotal,
//     subscriptionItems: cost.lineItems,
//   },

// });


// Subscriptions.update({
//   customerId: 'zA2eKzffCuXwqETWY',
// }, {
//   $set: {
//     amount: cost.actualTotal,
//     subscriptionItems: cost.lineItems,
//   },

// });

// const syncCreateSubscriptionFromCustomerProfile = Meteor.wrapAsync(createSubscriptionFromCustomerProfile);

// const createSubscriptionFromCustomerProfileRes = syncCreateSubscriptionFromCustomerProfile(
//   '1935114800',
//   '1948695142',
//   '2018-09-29',
//   69.61,
// );

// console.log(createSubscriptionFromCustomerProfileRes);
