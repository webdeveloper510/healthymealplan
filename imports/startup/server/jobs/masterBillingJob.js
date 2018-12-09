import { Job } from 'meteor/vsivsi:job-collection';
import { Meteor } from 'meteor/meteor';

import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import GiftCards from '../../../api/GiftCards/GiftCards';
import Discounts from '../../../api/Discounts/Discounts';
import Jobs from '../../../api/Jobs/Jobs';

// import GiftCard from '../../../modules/GiftCard/GiftCard';

import sendSubscriptionsChargeSummaryEmail from '../../../modules/server/billing/sendSubscriptionChargeSummaryEmail';

Job.processJobs(
  'coreJobQueue',
  'masterBillingJob',
  {
    errorCallback(err) {
      console.log('MASTER BILLING JOB ERROR');
      console.log(err);
    },
  },
  (job, cb) => {
    const activeSubs = Subscriptions.aggregate([
      {
        $match: {
          status: 'active',
          $or: [{ paymentMethod: 'card' }, { giftCardApplied: { $exists: true } }],
        },
      },
      {
        $lookup: {
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
          from: 'users',
        },
      },
      {
        $unwind: '$customer',
      },
      {
        $project: {
          _id: 1,
          customerId: 1,
          authorizeCustomerProfileId: 1,
          authorizePaymentProfileId: 1,
          amount: 1,
          discountApplied: 1,
          giftCardApplied: 1,
          paymentMethod: 1,
          customer: {
            profile: 1,
            emails: 1,
            associatedProfiles: 1,
          },
        },
      },
    ]);

    const activeSubsDetails = [];
    const subscriptionToBeCharged = [];

    activeSubs.forEach((e) => {
      activeSubsDetails.push({
        name: `${e.customer.profile.name.first} ${e.customer.profile.name.last}` || '',
        amount: e.amount,
        giftCard: e.giftCardApplied ? 'Yes' : '-',
        discount: e.discountApplied ? 'Yes' : '-',
        paymentMethod: e.paymentMethod.charAt(0).toUpperCase() + e.paymentMethod.substr(1),
      });

      subscriptionToBeCharged.push({
        subscriptionId: e._id,
        amount: e.amount,
        giftCard: !!e.giftCardApplied,
        discount: !!e.discountApplied,
        paymentMethod: e.paymentMethod,
      });

      const slaveJob = new Job(Jobs, 'slaveChargeJob', { subscriptionId: e._id });

      slaveJob.priority('normal').save();

    });

    // create an email that gives a summary of active subscriptions and their charges
    sendSubscriptionsChargeSummaryEmail({
      activeSubs: activeSubsDetails,
    });

    // add all the subscriptions to the master job that should be charged this week, model below
    Jobs.update({ runId: job._doc.runId }, {
      $set: {
        'data.subscriptionToBeCharged': subscriptionToBeCharged,
      },
    });


    // create a slave charge job for each subscription


    // set job done


    job.done(); // when done successfully

    // Be sure to invoke the callback
    // when work on this job has finished
    cb();
  },
);

const masterBillingJobExists = Jobs.findOne({
  type: 'masterBillingJob', status: 'waiting',
}, {
  sort: { created: -1 },
});

// console.log(masterBillingJobExists);

if (!masterBillingJobExists) {
  const masterBillingJobActual = new Job(Jobs, 'masterBillingJob', {}).repeat({
    schedule: Jobs.later.parse.text('on every Saturday at 10 am'),
  }).save();
}


// export default worker;

