import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Meals from './Meals';
import rateLimit from '../../modules/rate-limit';
import { getNextSequence } from '../../modules/server/get-next-sequence';

Meteor.methods({
  'meals.insert': function mealsInsert(meal) {
    check(meal, {
      title: String,
      type: String,
    });

    let nextSeqItem = getNextSequence('meals');
    nextSeqItem = nextSeqItem.toString();

    try {
      return Meals.insert({ SKU: nextSeqItem, ...meal, createdBy: this.userId });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'meals.update': function mealsUpdate(meal) {
    check(meal, {
      _id: String,
      title: String,
      type: String,
    });

    try {
      const mealId = meal._id;
      Meals.update(mealId, { $set: meal });
      return mealId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'meals.remove': function mealsRemove(mealId) {
    check(mealId, String);

    try {
      return Meals.remove(mealId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'meals.batchRemove': function mealsBatchRemove(mealIds) {
    check(mealIds, Array);
    console.log('Server: meals.batchRemove');

    try {
      return Meals.remove({ _id: { $in: mealIds } });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'meals.insert',
    'meals.update',
    'meals.remove',
    'meals.batchRemove',
  ],
  limit: 5,
  timeRange: 1000,
});
