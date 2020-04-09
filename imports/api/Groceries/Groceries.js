/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Groceries = new Mongo.Collection('Groceries');

Groceries.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Groceries.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Groceries.schema = new SimpleSchema({
  SKU: {
    type: String,
    label: 'SKU of the item',
  },

  title: {
    type: String,
    label: 'The title of the plate.',
  },

  subtitle: {
    type: String,
    label: 'Subtitle of the plate.',
    optional: true,
  },

  slug: {
    type: String,
    label: 'URL slug',
  },

  variants: {
    type: Array,
    optional: true,
    blackbox: true,
  },

  'variants.$': {
    type: Object,
    blackbox: true,
  },
  mealType: {
    type: String,
    label: 'Meal type of the plate.',
  },

  description: {
    type: String,
    label: 'This is a long description for blog',
    optional: true,
  },

  imageUrl: {
    type: String,
    label: 'URL of the plate image.',
    optional: true,
  },

  largeImageUrl: {
    type: String,
    label: 'URL of the large plate image.',
    optional: true,
  },

  custom: {
    type: Boolean,
    label: 'If the side is custom',
    optional: true,
  },

  nutritional: {
    type: Object,
    optional: true,
  },

  'nutritional.regular': {
    type: Object,
    optional: true,
  },

  'nutritional.regular.calories': {
    type: String,
    optional: true,
  },

  'nutritional.regular.proteins': {
    type: String,
    optional: true,
  },
  'nutritional.regular.carbs': {
    type: String,
    optional: true,
  },

  'nutritional.regular.fat': {
    type: String,
    optional: true,
  },

  createdAt: {
    type: String,
    label: 'The date this grocery item was created.',
    autoValue() {
      if (this.isInsert) return new Date().toISOString();
    },
  },
  createdBy: {
    type: String,
    label: 'The userId of the creator.',
  },
  updatedAt: {
    type: String,
    label: 'The date this grocery item was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return new Date().toISOString();
    },
  },
});

Groceries.attachSchema(Groceries.schema);

export default Groceries;
