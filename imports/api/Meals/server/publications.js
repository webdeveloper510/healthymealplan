import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import Meals from '../Meals';

Meteor.publish('Meals', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return Meals.find();
});

// Note: Meals.view is also used when editing an existing document.
Meteor.publish('meals.view', (mealId) => {
  check(mealId, String);
  return Meals.find({ _id: mealId });
});

Meteor.publish('meals-all-count', function () {
  Counts.publish(this, 'meals-count', Meals.find());
});

