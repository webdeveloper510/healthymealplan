
import { Job } from 'meteor/vsivsi:job-collection';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import Subscriptions from '../../../api/Subscriptions/Subscriptions';
import Lifestyles from '../../../api/Lifestyles/Lifestyles';
import Discounts from '../../../api/Discounts/Discounts';

import calculateSubscriptionCost from '../../../modules/server/billing/calculateSubscriptionCost';
import updateSubscription from '../../../modules/server/authorize/updateSubscription';

const worker = Job.processJobs(
  'coreJobQueue',
  'editSubscriptionJob',
  (job, cb) => {
    const data = job.data;
    // do anything with the job data here.
    // when done, call job.done() or job.fail()

    console.log('Inside editSubscriptionJob');

    const billing = calculateSubscriptionCost(data);

    const sub = Subscriptions.findOne({ customerId: data.id });

    const syncUpdateSubscription = Meteor.wrapAsync(updateSubscription);
    const updateSubscriptionRes = syncUpdateSubscription(sub.authorizeSubscriptionId, billing.actualTotal);

    if (updateSubscriptionRes.messages.resultCode != 'Ok') {
      job.fail('Could not update subscription on [Authorize.net]');
    }

    console.log('Inside editSubscriptionJob: Updated subscription on authorize end');

    if (data.secondaryProfiles && data.secondaryProfiles.length > 0) {
      data.secondaryProfiles.forEach((e) => {
        if (e._id) {
          Meteor.users.update({ _id: e._id }, {
            $set: {
              profile: {
                name: {
                  first: e.first_name,
                  last: e.last_name,
                },
              },

              secondary: true,
              primaryAccount: data.id,
              subscriptionId: data.subscriptionId,

              lifestyle: Lifestyles.findOne({ $or: [{ title: e.lifestyle }, { _id: e.lifestyle }] })._id,
              discount: e.discount,
              restrictions: e.restrictions,
              specificRestrictions: e.specificRestrictions,
              preferences: e.subIngredients,

              schedule: e.scheduleReal,

              platingNotes: e.platingNotes,
              adultOrChild: e.adultOrChild,
            },
          });
        } else {
          const randomId = Random.id();

          Meteor.users.insert({
            _id: randomId,
            profile: {
              name: {
                first: e.first_name,
                last: e.last_name,
              },
            },
            secondary: true,
            primaryAccount: data.id,
            subscriptionId: data.subscriptionId,
            username: Random.id(),
            lifestyle: Lifestyles.findOne({ $or: [{ title: e.lifestyle }, { _id: e.lifestyle }] })._id,
            discount: e.discount,
            restrictions: e.restrictions,
            specificRestrictions: e.specificRestrictions,
            preferences: e.subIngredients,
            platingNotes: e.platingNotes,
            roles: ['customer'],
            schedule: e.scheduleReal,
            adultOrChild: e.adultOrChild,

          });
        }
      });
    }

    if (data.secondaryProfilesRemoved.length > 0) {
      Meteor.users.remove({ _id: { $in: data.secondaryProfilesRemoved } });
    }

    const secondaryAccounts = Meteor.users.find({
      primaryAccount: data.id,
    }).fetch();

    // console.log(secondaryAccounts);

    const secondaryAccountIds = [];

    secondaryAccounts.forEach((e) => {
      secondaryAccountIds.push(e._id);
    });

    Meteor.users.update({ _id: data.id }, {
      $set: {
        lifestyle: data.lifestyle,
        discount: data.discount,

        schedule: data.scheduleReal,

        restrictions: data.restrictions,
        specificRestrictions: data.specificRestrictions,
        preferences: data.subIngredients,
        platingNotes: data.platingNotes,
        address: data.address,
        secondaryAccounts: secondaryAccountIds,
        associatedProfiles: secondaryAccountIds.length,
        coolerBag: data.coolerBag,
        notifications: data.notifications,
      },
    });

    const newDeliveryType = data.delivery.map((e, i) => {
      if (e == '') {
        return data.delivery[i] == null;
      }

      return e;
    });

    const keysToUnset = {};
    const keysToSet = {
      completeSchedule: data.completeSchedule,
      delivery: newDeliveryType,
      amount: billing.actualTotal,
      subscriptionItems: billing.lineItems,
    };

    if (data.hasOwnProperty('discountCodeRemove')) {
      if (data.discountCodeRemove) {
        console.log('Going in discountCodeRemove inner if statement');
        keysToUnset.discountApplied = 1;
      }
    }

    if (data.hasOwnProperty('discountCode') && !keysToUnset.hasOwnProperty('discountApplied')) {
      console.log('Going in discountCode inner KEY SET statement');

      if (data.discountCode.length > 0) {
        keysToSet.discountApplied = Discounts.findOne({ $or: [{ title: data.discountCode }, { _id: data.discountCode }] })._id;
      }
    }

    // console.log(keysToSet);

    Subscriptions.update({
      _id: data.subscriptionId,
    }, {
      $set: keysToSet,
      $unset: keysToUnset,
    });

    console.log('Inside editSubscriptionJob: Updated subscription on Vittle');


    job.done(); // when done successfully

    // Be sure to invoke the callback
    // when work on this job has finished
    cb();
  },
);

export default worker;
