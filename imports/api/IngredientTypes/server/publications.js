import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import IngredientTypes from '../IngredientTypes';

Meteor.publish('ingredientTypes', function ingredientTypes(selector, options){
  check(selector, Match.Any);
  check(options, Match.Any);

  return IngredientTypes.find()
});

// Note: IngredientTypes.view is also used when editing an existing document.
Meteor.publish('ingredientTypes.view', (ingredientTypeId) => {
  check(ingredientTypeId, String);
  return IngredientTypes.find({ _id: ingredientTypeId });
});

Meteor.publish('types-all-count', function () {
  Counts.publish(this, 'types', IngredientTypes.find());
});

