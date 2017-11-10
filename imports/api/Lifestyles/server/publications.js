import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import Categories from '../Categories';

Meteor.publish('categories', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return Categories.find();
});

// Note: IngredientTypes.view is also used when editing an existing document.
Meteor.publish('categories.view', (categoryId) => {
  check(categoryId, String);

  return Categories.find({ _id: categoryId });
});

Meteor.publish('categories-all-count', function categoryCount() {
  Counts.publish(this, 'categories', Categories.find());
});

