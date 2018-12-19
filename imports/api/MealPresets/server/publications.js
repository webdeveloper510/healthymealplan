import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import MealPresets from '../MealPresets';

Meteor.publish('mealpresets', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return MealPresets.find();
});

// Note: IngredientTypes.view is also used when editing an existing document.
Meteor.publish('mealpresets.view', (prestId) => {
  check(prestId, String);

  return MealPresets.find({ _id: prestId });
});

Meteor.publish('mealpresets-all-count', function mealPresetsCount() {
  Counts.publish(this, 'mealpresets-count', MealPresets.find());
});

