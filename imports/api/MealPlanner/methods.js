import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import MealPlanner from './MealPlanner';
import rateLimit from '../../modules/rate-limit';

import sumBy from 'lodash/sumBy';
import moment from 'moment';

Meteor.methods({
  'mealPlanner.insert': function mealPlannerInsert(date, lifestyle, meal, plate) {

    check(date, String);
    check(lifestyle, String);
    check(meal, String);
    check(plate, String);

    try {
      return MealPlanner.insert({
        onDate: date,
        lifestyleId: lifestyle,
        mealId: meal,
        plateId: plate,
      });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'mealPlanner.update': function mealPlannerUpdate(forDate, reassignPlannerId, plateIdNew) {
    // check(lifestyleId, String);
    // check(mealId, String);
    check(forDate, String);
    check(plateIdNew, String);
    check(reassignPlannerId, String);


    try {
      MealPlanner.update({ _id: reassignPlannerId, onDate: forDate }, { $set: { plateId: plateIdNew } });

      return reassignPlannerId;
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
