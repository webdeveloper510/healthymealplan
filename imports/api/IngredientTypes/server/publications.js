import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import IngredientTypes from '../IngredientTypes';

Meteor.publish('ingredientTypes', () => IngredientTypes.find());

// Note: IngredientTypes.view is also used when editing an existing document.
Meteor.publish('ingredientTypes.view', (ingredientTypeId) => {
  check(ingredientTypeId, String);
  return IngredientTypes.find({ _id: ingredientTypeId });
});
