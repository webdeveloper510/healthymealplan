import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import MealPresets from './MealPresets';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'presets.insert': function mealPrestsInsert(data) {
    check(data, {
      title: String,
      weekPresetMonday: Array,
      weekPresetTuesday: Array,
      weekPresetWednesday: Array,
      weekPresetThursday: Array,
      weekPresetFriday: Array,
    });

    try {
      return MealPresets.insert(data);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'presets.update': function presetsUpdate(data) {
    check(data, {
      _id: String,
      title: String,
      weekPresetMonday: Array,
      weekPresetTuesday: Array,
      weekPresetWednesday: Array,
      weekPresetThursday: Array,
      weekPresetFriday: Array,
    });

    try {
      MealPresets.update({ _id: data._id }, { $set: data });

      return data._id;
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'presets.remove': function presetRemove(presetId) {
    check(presetId, String);

    try {
      MealPresets.remove({ _id: presetId });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'presets.batchRemove': function presetsBatchRemove(presetIds) {
    check(presetIds, Array);

    try {
      MealPresets.remove({ _id: { $in: presetIds } });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

});

rateLimit({
  methods: [
    'presets.insert',
    'presets.update',
    'presets.remove',
    'presets.batchRemove',
  ],
  limit: 5,
  timeRange: 1000,
});
