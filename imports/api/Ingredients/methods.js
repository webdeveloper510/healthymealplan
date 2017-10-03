import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Ingredients from './Ingredients';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'ingredients.insert': function ingredientsInsert(ingredient) {
    check(ingredient, {
      title: String,
    });

    console.log(ingredient);

    try {
      return Ingredients.insert({ createdBy: this.userId, ...ingredient });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'ingredients.update': function ingredientsUpdate(ingredient) {
    check(ingredient, {
      _id: String,
      title: String,
    });

    try {
      const ingredientId = ingredient._id;
      Ingredients.update(ingredientId, { $set: ingredient });
      return ingredientId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'ingredients.remove': function ingredientsRemove(ingredientId) {
    check(ingredientId, String);

    try {
      return Ingredients.remove(ingredientId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'ingredients.insert',
    'ingredients.update',
    'ingredients.remove',
  ],
  limit: 5,
  timeRange: 1000,
});
