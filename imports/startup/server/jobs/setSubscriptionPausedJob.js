import { Job } from 'meteor/vsivsi:job-collection';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';

import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import Jobs from '../../../api/Jobs/Jobs';

const worker = Job.processJobs(
    'coreJobQueue',
    'setSubscriptionPausedJob',
    (job, cb) => {
        const insertData = job.data;

        // do anything with the job data here.
        // when done, call job.done() or job.fail()

        try {
            Subscriptions.update({ _id: insertData.subscriptionId },
                {
                    $set: {
                        status: 'paused',
                    },
                },
            );

            const friday = moment(insertData.activationDate).hour(23).toDate();

            const activateJob = new Job(Jobs, 'setSubscriptionActiveJob', {
                subscriptionId: insertData.subscriptionId,
                customerId: insertData.customerId,
                fromPause: true,
            });

            activateJob.priority('normal').after(friday).save();

        } catch (error) {
            job.log(
                'setSubscriptionPaused for customer: ' +
                insertData.customerId +
                ' with subscription - ' +
                insertData.subscriptionId +
                ' failed.',
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
