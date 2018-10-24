import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import Discounts from '../Discounts';

Meteor.publish('discounts', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return Discounts.find();
});

// Note: IngredientTypes.view is also used when editing an existing document.
Meteor.publish('discounts.view', (discountId) => {
  check(discountId, String);

  return Discounts.find({ _id: discountId });
});

Meteor.publish('discounts-all-count', function discountsCount() {
  Counts.publish(this, 'discounts-count', Discounts.find());
});

