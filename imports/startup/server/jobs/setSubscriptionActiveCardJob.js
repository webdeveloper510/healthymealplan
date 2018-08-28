import { Job } from 'meteor/vsivsi:job-collection';
import { Meteor } from 'meteor/meteor';

import Subscriptions from '../../../api/Subscriptions/Subscriptions';

import createSubscriptionFromCustomerProfile from '../../../modules/server/authorize/createSubscriptionFromCustomerProfile';

const worker = Job.processJobs(
  'coreJobQueue',
  'setSubscriptionActiveCardJob',
  (job, cb) => {
    const insertData = job.data;
    // do anything with the job data here.
    // when done, call job.done() or job.fail()
    const subscription = Subscriptions.findOne({ customerId: insertData.customerId });

    try {
      const syncCreateSubscriptionFromCustomerProfile = Meteor.wrapAsync(createSubscriptionFromCustomerProfile);

      const syncCreateSubscriptionFromCustomerProfileRes = syncCreateSubscriptionFromCustomerProfile(
        subscription.authorizeCustomerProfileId,
        subscription.authorizePaymentProfileId,
        insertData.subDate,
        subscription.amount,
      );

      if (syncCreateSubscriptionFromCustomerProfileRes.messages.resultCode == 'Ok') {
        const newAuthSubId = syncCreateSubscriptionFromCustomerProfileRes.subscriptionId;

        Subscriptions.update({ customerId: insertData.customerId },
          {
            $set: {
              status: 'paused',
              authorizeSubscriptionId: newAuthSubId, // when done successfully
              amount: subscription.amount,
            },
          });
      } else {
        job.fail(syncCreateSubscriptionFromCustomerProfileRes.messages.message[0].text); // when failing
      }
    } catch (error) {
      console.log(error);

      job.log(`setSubscriptionActiveCardJob for customer: ${insertData.customerId} with subscription - ${insertData.subscriptionId} failed.`);
      job.fail(error); // when failing
    }

    job.done();

    // Be sure to invoke the callback
    // when work on this job has finished
    cb();
  },
);

export default worker;
