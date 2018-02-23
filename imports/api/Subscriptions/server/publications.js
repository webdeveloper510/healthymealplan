import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import Subscriptions from '../Subscriptions';

Meteor.publish('subscriptions', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return Subscriptions.find(selector, options);
});

// Note: IngredientTypes.view is also used when editing an existing document.
Meteor.publish('subscriptions.view', (subId) => {
  check(subId, String);

  return Subscriptions.find({ _id: subId });
});

Meteor.publish('subscriptions.single', (cusId) => {
  check(cusId, String);

  return Subscriptions.find({ customerId: cusId });
});

Meteor.publish('subscriptions-all-count', function categoryCount() {
  Counts.publish(this, 'subscriptions', Subscriptions.find());
});
