import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import MealPlanner from './MealPlanner';
import MealPresets from '../MealPresets/MealPresets';
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
  'mealPlanner.remove': function mealPlannerUpdate(mealPlannerId) {
    check(mealPlannerId, String);

    try {
      MealPlanner.remove({ _id: mealPlannerId });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'mealPlanner.applyPreset': function mealPlannerUpdate(presetId, weekStart) {
    check(presetId, String);
    check(weekStart, String);

    const preset = MealPresets.findOne({ _id: presetId });

    if (!preset) {
      throw new Meteor.Error(404, 'Preset not found');
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thurdsay', 'Friday'];
    const weekStartDate = moment(weekStart);

    for (let i = 1; i <= 5; i++) {
      const day = days[i - 1];
      const presetForTheDay = preset[`weekPreset${day}`];

      if (presetForTheDay == [] || !presetForTheDay) {
        continue;
      }

      presetForTheDay.map((presetCurrentDay) => {
        const plannerData = {
          onDate: moment(weekStart).isoWeekday(i).format('YYYY-MM-DD'),
          lifestyleId: presetCurrentDay.lifestyleId,
          mealId: presetCurrentDay.mealId,
          plateId: presetCurrentDay.plateId,
        };

        MealPlanner.update(plannerData, { $set: plannerData }, { upsert: true });
      });
    }
  },
  'mealPlanner.clearWeek': function mealPlannerUpdate(weekStart) {
    check(weekStart, String);

    try {
      const dataToRemove = [1, 2, 3, 4, 5].map(e => moment(weekStart).isoWeekday(e).format('YYYY-MM-DD'));

      MealPlanner.remove({ onDate: { $in: dataToRemove } });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'mealPlanner.insert',
    'mealPlanner.update',
    'mealPlanner.remove',
    'mealPlanner.applyPreset',
    'mealPlanner.clearWeek',
    'mealPlanner.batchUpdate',
  ],
  limit: 5,
  timeRange: 1000,
});
