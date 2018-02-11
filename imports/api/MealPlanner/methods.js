import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import MealPlanner from './MealPlanner';
import rateLimit from '../../modules/rate-limit';

import sumBy from 'lodash/sumBy';
import moment from 'moment';

Meteor.methods({
  'mealPlanner.insert': function mealPlannerInsert(cat) {
    check(cat, {
      title: String,
      types: Array,
    });

    const existsCategory = MealPlanner.findOne({ title: cat.title });

    if (existsCategory) {
      throw new Meteor.Error('500', `${cat.title} is already present`);
    }

    try {
      return MealPlanner.insert({ title: cat.title, types: cat.types, owner: this.userId });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'mealPlanner.update': function mealPlannerUpdate(deliveryId, statusChange) {
    check(deliveryId, String);
    check(statusChange, String);

    console.log(deliveryId);
    console.log(statusChange);


    try {
      const updated = MealPlanner.update({ _id: deliveryId }, { $set: { status: statusChange } });

      return deliveryId;
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'mealPlanner.batchUpdate': function mealPlannerBatchUpdate(deliveryIds, statusChange) {
    check(deliveryIds, Array);
    check(statusChange, String);

    console.log(deliveryIds);
    console.log(statusChange);

    console.log('Server: mealPlanner.batchUpdate');

    try {
      const batchUpdate = MealPlanner.update({ _id: { $in: deliveryIds } }, { $set: { status: statusChange } }, { multi: true });

    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'mealPlanner.insert',
    'mealPlanner.update',
    'mealPlanner.batchUpdate',
  ],
  limit: 5,
  timeRange: 1000,
});
