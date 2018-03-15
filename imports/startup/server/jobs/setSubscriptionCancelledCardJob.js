import { Job } from 'meteor/vsivsi:job-collection';
import { Meteor } from 'meteor/meteor';

import Subscriptions from '../../../api/Subscriptions/Subscriptions';

import cancelSubscription from '../../../modules/server/authorize/cancelSubscription';

const worker = Job.processJobs(
  'coreJobQueue',
  'setSubscriptionCancelledCardJob',
  (job, cb) => {
    const insertData = job.data;

    // do anything with the job data here.
    // when done, call job.done() or job.fail()
    const subscription = Subscriptions.findOne({ customerId: insertData.customerId });

    try {
      const syncCancelSubscription = Meteor.wrapAsync(cancelSubscription);

      const syncCancelSubscriptionRes = syncCancelSubscription(subscription.authorizeSubscriptionId);

      if (syncCancelSubscriptionRes.messages.resultCode == 'Ok') {
        Subscriptions.update({ customerId: insertData.customerId }, { $set: { status: 'cancelled' } });
      } else {
        job.fail(syncCancelSubscriptionRes.messages.message[0].text); // when failing
      }
    } catch (error) {
      job.log(
        `setSubscriptionCancelledCardJob for customer: ${
        insertData.customerId
        } with subscription - ${
        insertData.subscriptionId
        } failed.`,
      );
      job.fail(error); // when failing
    }

    job.done(); // when done successfully

    // Be sure to invoke the callback
    // when work on this job has finished
    cb();
  },
);

export default worker;
