import { Job } from 'meteor/vsivsi:job-collection';
import { Meteor } from 'meteor/meteor';

import getTransactionDetails from '../../../modules/server/authorize/getTransactionDetails';

import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import Invoices from '../../../api/Invoices/Invoices';

const worker = Job.processJobs(
  'coreJobQueue',
  'setSubscriptionActiveCard',
  (job, cb) => {
    // do anything with the job data here.
    // when done, call job.done() or job.fail()

    console.log('setSubscriptionActive Starts');

    const syncGetTransactionDetails = Meteor.wrapAsync(getTransactionDetails);

    const transaction = syncGetTransactionDetails(job.data.id);

    // console.log(transaction)

    if (!transaction) {
      job.fail('No transaction found');
    } else if (transaction.transaction.responseCode != '1') {
      job.fail(
        'Transaction responseCode' + transaction.transaction.responseCode,
      );
    } else if (transaction.transaction.customer == undefined) {
      job.fail('No customer found on transaction');
    } else if (transaction.transaction.hasOwnProperty('customer') && transaction.transaction.customer.id == undefined) {
      job.fail('No customer found on transaction ID');
    }

    const subscription = Subscriptions.findOne({
      customerId: transaction.transaction.customer.id,
    });

    // console.log('SUBSCRIPTION:');

    // console.log(subscription);

    if (subscription && subscription.status != 'active') {
      try {
        Subscriptions.update(
          {
            customerId: transaction.transaction.customer.id,
          },
          {
            $set: {
              status: 'active',
            },
          },
        );
      } catch (error) {
        job.log(
          'setSubscriptionActiveCard for customer: ' +
          transaction.transaction.customer.id +
          ' - ' +
          ' failed.',
        );
        job.fail("Failed when setting subscription active"); // when failing
      }

      try {
        Invoices.insert({
          customerId: transaction.transaction.customer.id,
          transactionId: job.data.id,
          subscriptionId: subscription._id,
          lineItems: subscription.subscriptionItems,
        });
      } catch (error) {
        job.log(
          'createInvoicesCard for subscription - ' +
          subscription._id +
          ' failed.',
        );
        job.fail("Failed when creating invoice"); // when failing
      }
    } else if (subscription && subscription.status == 'active') {
      try {
        Invoices.insert({
          customerId: transaction.transaction.customer.id,
          transactionId: job.data.id,
          subscriptionId: subscription._id,
          lineItems: subscription.subscriptionItems,
        });
      } catch (error) {
        job.log(
          'createInvoicesCard for subscription - ' +
          subscription._id +
          ' failed.',
        );
        job.fail("Failed when creating invoice"); // when failing
      }
    }

    job.done(); // when done successfully

    // Be sure to invoke the callback
    // when work on this job has finished
    cb();
  },
);

export default worker;
