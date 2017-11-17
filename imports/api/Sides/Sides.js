/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Sides = new Mongo.Collection('Sides');

Sides.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Sides.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Sides.schema = new SimpleSchema({

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
    optional: true
  },

  imageId: {
    type: String,
    label: '_id of the plate image.',
    optional: true,
  },

  mealType: {
    type: String,
    label: 'Meal type of the side.',
  },

  ingredients: {
    type: Array,
    label: 'Ingredients belonging to the side.',
  },

  'ingredients.$': {
    type: Object,
    optional: true,
  },

  'ingredients.$._id': {
    type: String,
    optional: true,
  },

  'ingredients.$.title': {
    type: String,
    optional: true,
  },

  createdAt: {
    type: String,
    label: 'The date this ingredient was created.',
    autoValue() {
      if (this.isInsert) return (new Date()).toISOString();
    },
  },
  createdBy: {
    type: String,
    label: 'The userId of the creator.',

  },
  updatedAt: {
    type: String,
    label: 'The date this ingredient was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
    },
  },


});

Sides.attachSchema(Sides.schema);

export default Sides;
