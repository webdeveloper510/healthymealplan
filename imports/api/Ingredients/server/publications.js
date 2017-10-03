import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Ingredients from '../Ingredients';

Meteor.publish('ingredients', function ingredients() {
  return Ingredients.find({ owner: this.userId });
});

// Note: Ingredients.view is also used when editing an existing document.
Meteor.publish('ingredients.view', (ingredientId) => {
  check(ingredientId, String);
  return Ingredients.find({ _id: ingredientId });
});
