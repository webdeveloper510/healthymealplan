import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import Deliveries from '../Deliveries';

Meteor.publish('deliveries', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return Deliveries.find();
});

// Note: IngredientTypes.view is also used when editing an existing document.
Meteor.publish('deliveries.view', (categoryId) => {
  check(categoryId, String);

  return Deliveries.find({ _id: categoryId });
});

Meteor.publish('deliveries-all-count', function categoryCount() {
  Counts.publish(this, 'deliveries', Deliveries.find());
});

