import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import MealPlanner from '../MealPlanner';

Meteor.publish('mealplanner', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return MealPlanner.find();
});

// Note: IngredientTypes.view is also used when editing an existing document.
Meteor.publish('mealplanner.view', (categoryId) => {
  check(categoryId, String);

  return MealPlanner.find({ _id: categoryId });
});

Meteor.publish('mealplanner-all-count', function categoryCount() {
  Counts.publish(this, 'mealplanners', MealPlanner.find());
});

