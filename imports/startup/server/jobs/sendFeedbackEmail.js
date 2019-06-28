import { Job } from 'meteor/vsivsi:job-collection';
import { Meteor } from 'meteor/meteor';

import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import sendFeedbackEmail from '../../../api/Users/server/send-feedback-email';

const worker = Job.processJobs('coreJobQueue', 'sendFeedbackEmailJob', (job, cb) => {
        const userData = job.data;

        const user = Meteor.users.findOne({ _id: userData.customerId, });

        if (!user) {
            job.log('User not found' + userData.customerId);
            job.fail("User not found: " + userData.customerId); // when failing
        }

        try {
            sendFeedbackEmail({
                emailAddress: user.emails[0].address,
                firstName: user.profile.name.first,
            }).catch(e => {
                console.log()
                console.log(e);
            });

        } catch (error) {
            console.log("Error with sendFeedbackEmailJob with _id: " + userData.customerId);
            job.fail("Error with sendFeedbackEmailJob with _id: " + userData.customerId); // when failing
        }

        job.done(); // when done successfully

        // Be sure to invoke the callback
        // when work on this job has finished
        cb();
    },
);

export default worker;
