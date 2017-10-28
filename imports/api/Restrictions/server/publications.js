import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import Restrictions from '../Restrictions';

Meteor.publish('restrictions', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return Restrictions.find();
});

// Note: IngredientTypes.view is also used when editing an existing document.
Meteor.publish('restrictions.view', (categoryId) => {
  check(categoryId, String);

  return Restrictions.find({ _id: categoryId });
});

Meteor.publish('restrictions-all-count', function categoryCount() {
  Counts.publish(this, 'restrictions', Restrictions.find());
});

