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
Meteor.publish('restrictions.view', (restrictionId) => {
  check(restrictionId, String);

  return Restrictions.find({ _id: restrictionId });
});

Meteor.publish('restrictions-all-count', function categoryCount() {
  Counts.publish(this, 'restrictions-count', Restrictions.find());
});

