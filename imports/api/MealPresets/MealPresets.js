/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const MealPresets = new Mongo.Collection('MealPresets');

MealPresets.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

MealPresets.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

MealPresets.schema = new SimpleSchema({
  title: {
    type: String,
    label: 'Customer ID of the delivery.',
  },
  weekPreset: {
    type: Array,
    label: 'Preset lifestyle meals for the week',
  },
  'weekPreset.$': {
    type: Object,
    label: 'Meal planner object',
  },
  'weekPreset.$.lifestyleId': {
    type: String,
    label: 'Customer ID of the delivery.',
  },
  'weekPreset.$.mealId': {
    type: String,
    label: 'The subscription id of the delivery.',
  },
  'weekPreset.$.plateId': {
    type: String,
    label: 'The id of the meal',
  },
  'weekPreset.$.onDate': {
    type: String,
    label: 'Date to be cooked on',
  },
  weekOf: {
    type: Date,
    label: 'Week start date',
  },
  createdAt: {
    type: String,
    label: 'The date this delivery was created.',
    autoValue() {
      if (this.isInsert) return (new Date()).toISOString();
    },
  },
  updatedAt: {
    type: String,
    label: 'The date this delivery was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
    },
  },

});

MealPresets.attachSchema(MealPresets.schema);

export default MealPresets;
