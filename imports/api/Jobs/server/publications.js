import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Jobs from '../Jobs';

// eslint-disable-next-line
Meteor.publish('jobs.subscription', function jobsSubscription(userId) {

  check(userId, String);

  return Jobs.find({ $or: [{ 'data.id': userId }, { 'data.customerId': userId }] }, {
    fields: {
      _id: 1,
      status: 1,
      type: 1,
      data: 1,
      created: 1,
      updated: 1,
      after: 1,
    },
  });
});

Meteor.publish('jobs.editSubscription', function jobsEditSubscription() {
  return Jobs.find({
    type: {
      $in: ['editSubscriptionJob', 'editSubscriptionJobNonCard'],
    },
    'data.id': this.userId,
  }, {
    fields: {
      _id: 1,
      status: 1,
      type: 1,
      data: 1,
      created: 1,
      updated: 1,
      after: 1,
    },
  });
});
