import { Job } from 'meteor/vsivsi:job-collection';
import { Meteor } from 'meteor/meteor';

import Discounts from '../../../api/Discounts/Discounts';

const worker = Job.processJobs('coreJobQueue', 'disableDiscountJob', (job, cb) => {
  const data = job.data;
  // do anything with the job data here.
  // when done, call job.done() or job.fail()

  try {
    Discounts.update({
      _id: data._id,
    }, {
        $set: {
          status: "expired"
        }
      });
  } catch (error) {
    job.log(`disableDiscountJob for discount - ${data._id} failed.`);
    // job.fail(error); // when failing
  }

  job.done(); // when done successfully

  // Be sure to invoke the callback
  // when work on this job has finished
  cb();
});

export default worker;
