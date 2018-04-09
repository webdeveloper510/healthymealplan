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
Meteor.publish('discounts.view', (categoryId) => {
  check(categoryId, String);

  return Discounts.find({ _id: categoryId });
});

Meteor.publish('discounts-all-count', function categoryCount() {
  Counts.publish(this, 'discounts', Discounts.find());
});

