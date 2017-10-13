import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import IngredientTypes from './IngredientTypes';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'ingredientTypes.insert': function ingredientTypesInsert(ingredientType) {
    check(ingredientType, {
      title: String,
    });

    try {
      return IngredientTypes.insert({ createdBy: this.userId, ...ingredientType });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'ingredientTypes.update': function ingredientTypesUpdate(ingredientType) {
    check(ingredientType, {
      _id: String,
      title: String,
    });

    try {
      const ingredientTypeId = ingredientType._id;
      IngredientTypes.update(ingredientTypeId, { $set: ingredientType });
      return ingredientTypeId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'ingredientTypes.remove': function ingredientTypesRemove(ingredientTypeId) {
    check(ingredientTypeId, String);

    try {
      return IngredientTypes.remove(ingredientTypeId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'ingredientTypes.insert',
    'ingredientTypes.update',
    'ingredientTypes.remove',
  ],
  limit: 5,
  timeRange: 1000,
});
