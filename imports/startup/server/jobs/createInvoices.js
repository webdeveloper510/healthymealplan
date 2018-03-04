import { Job } from 'meteor/vsivsi:job-collection';
import { Meteor } from 'meteor/meteor';

import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import Invoices from '../../../api/Invoices/Invoices';

const worker = Job.processJobs('coreJobQueue', 'createInvoices', (job, cb) => {
  // const insertData = job.data;
  // do anything with the job data here.
  // when done, call job.done() or job.fail()

  const nonCardSubs = Subscriptions.find({
    status: 'active',
    paymentMethod: { $in: ['cash', 'interac'] },
  }).fetch();

  console.log(nonCardSubs);

  nonCardSubs.forEach((e, i) => {
    try {
      Invoices.insert({
        subscriptionId: e._id,
        lineItems: e.subscriptionItems,
      });
    } catch (error) {
      job.log(`createInvoices for subscription - ${e._id} failed.`);
      // job.fail(error); // when failing
    }
  });

  job.done(); // when done successfully

  // Be sure to invoke the callback
  // when work on this job has finished
  cb();
});

export default worker;
