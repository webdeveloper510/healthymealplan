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
  weekPresetMonday: {
    type: Array,
    label: 'Preset array containing per lifestyle meals for the day',
  },
  'weekPresetMonday.$': {
    type: Object,
    label: 'Preset single plate object',
    blackbox: true,
  },
  weekPresetTuesday: {
    type: Array,
    label: 'Preset array containing per lifestyle meals for the day',
  },
  'weekPresetTuesday.$': {
    type: Object,
    label: 'Preset single plate object',
    blackbox: true,
  },
  weekPresetWednesday: {
    type: Array,
    label: 'Preset array containing per lifestyle meals for the day',
  },
  'weekPresetWednesday.$': {
    type: Object,
    label: 'Preset single plate object',
    blackbox: true,
  },
  weekPresetThursday: {
    type: Array,
    label: 'Preset array containing per lifestyle meals for the day',
  },
  'weekPresetThursday.$': {
    type: Object,
    label: 'Preset single plate object',
    blackbox: true,
  },
  weekPresetFriday: {
    type: Array,
    label: 'Preset array containing per lifestyle meals for the day',
  },
  'weekPresetFriday.$': {
    type: Object,
    label: 'Preset single plate object',
    blackbox: true,
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
