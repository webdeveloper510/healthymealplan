import { Job } from 'meteor/vsivsi:job-collection';
import { Meteor } from 'meteor/meteor';

import Subscriptions from '../../../api/Subscriptions/Subscriptions';

const worker = Job.processJobs(
  'coreJobQueue',
  'setSubscriptionActiveJob',
  (job, cb) => {
    const insertData = job.data;
    // do anything with the job data here.
    // when done, call job.done() or job.fail()

    const subscription = Subscriptions.findOne({ _id: insertData.subscriptionId });

    try {
      Subscriptions.update(
        {
          _id: insertData.subscriptionId,
        },
        {
          $set: {
            status: 'active',
          },
        },
      );
    } catch (error) {
      job.log(
        `setSubscriptionActiveJob for customer: ${
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
