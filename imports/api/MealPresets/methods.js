import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import MealPresets from './MealPresets';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'presets.insert': function mealPrestsInsert(date, lifestyle, meal, plate) {
    check(date, String);
    check(lifestyle, String);
    check(meal, String);
    check(plate, String);

    try {
      return MealPresets.insert({
        onDate: date,
        lifestyleId: lifestyle,
        mealId: meal,
        plateId: plate,
      });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'presets.update': function presetsUpdate(forDate, reassignPlannerId, plateIdNew) {
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
  'presets.remove': function presetsUpdate(presetId) {
    check(presetId, String);

    try {
      MealPlanner.remove({ _id: presetId });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

});

rateLimit({
  methods: [
    'mealPrests.insert',
    'mealPrests.update',
    'mealPrests.remove',
    'mealPrests.batchUpdate',
  ],
  limit: 5,
  timeRange: 1000,
});
