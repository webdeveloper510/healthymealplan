import { Job } from 'meteor/vsivsi:job-collection';
import { Meteor } from 'meteor/meteor';

import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import sendFirstRecoveryEmail from '../../../api/Users/server/send-first-recovery-email';

const worker = Job.processJobs('coreJobQueue', 'sendFirstRecoveryEmailJob', (job, cb) => {
  const userData = job.data;

  const user = Meteor.users.findOne({ _id: userData._id });

  if (!user) {
    job.log('User not found' + userData._id);
    job.fail("User not found: " + userData._id); // when failing
  }

  const userEmail = user.emails[0].address;

  try {

    sendFirstRecoveryEmail({
      emailAddress: userEmail,
      firstName: user.profile.name.first,
    }).catch(e => {
      console.log()
      console.log(e);
    });

  } catch (error) {
    console.log("Error with sendFirstRecoveryEmail with _id: " + userData._id);
    job.fail("Error with sendFirstRecoveryEmail with _id: " + userData._id); // when failing
  }

  job.done(); // when done successfully

  // Be sure to invoke the callback
  // when work on this job has finished
  cb();
},
);

export default worker;
