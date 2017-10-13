import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Ingredients from './Ingredients';
import rateLimit from '../../modules/rate-limit';

import { getNextSequence } from '../../modules/server/get-next-sequence';

Meteor.methods({
  'ingredients.insert': function ingredientsInsert(ingredient) {
    check(ingredient, {
      title: String,
      subIngredients: Array,
      typeId: String,
    });

    const existsingredient = Ingredients.findOne({ title: ingredient.title });

    if (existsingredient) {
      throw new Meteor.Error('500', `${ingredient.title} is already present`);
    }

    let nextSeqItem = getNextSequence('ingredients');
    nextSeqItem = nextSeqItem.toString();

    try {
      return Ingredients.insert({
        SKU: nextSeqItem,
        title: ingredient.title,
        subIngredients: ingredient.subIngredients,
        typeId: ingredient.typeId,
        createdBy: this.userId,
      });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'ingredients.update': function ingredientsUpdate(ingredient) {
    check(ingredient, {
      _id: String,
      title: String,
      subIngredients: Array,
      typeId: String,
    });

    try {
      const ingredientId = ingredient._id;
      Ingredients.update(ingredientId, {
        $set: {
          title: ingredient.title,
          typeId: ingredient.typeId,
          subIngredients: ingredient.subIngredients,
        },
      });

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
  'ingredients.subIngredients.insert': function ingredientsRemove(subIngredient) {
    console.log('Subingredients insert');
    check(subIngredient, {
      _id: String,
    });

    try {
      return Ingredients.remove(ingredientId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'ingredients.subIngredients.remove': function ingredientsRemove(subIngredientId) {
    check(subIngredientId, String);

    try {
      return Ingredients.remove(subIngredientId);
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
    'ingredients.subIngredients.insert',
    'ingredients.subIngredients.remove',
  ],
  limit: 5,
  timeRange: 1000,
});
