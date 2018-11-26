import { Job } from 'meteor/vsivsi:job-collection';
import { Meteor } from 'meteor/meteor';

import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import GiftCards from '../../../api/GiftCards/GiftCards';
import Discounts from '../../../api/Discounts/Discounts';
import Jobs from '../../../api/Jobs/Jobs';

import chargeCustomerPaymentProfile from '../../../modules/server/authorize/chargeCustomerPaymentProfile';

const worker = Job.processJobs(
  'coreJobQueue',
  'slaveChargeJob',
  (job, cb) => {
    const jobData = job.data;

    console.log(`Logging ${new Date()}`);

    const subscription = Subscriptions.findOne({ _id: jobData.subscriptionId });


    // set job done
    job.done(); // when done successfully

    // Be sure to invoke the callback
    // when work on this job has finished
    cb();
  },
);

export default worker;
