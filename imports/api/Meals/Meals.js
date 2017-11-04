/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Meals = new Mongo.Collection('Meals');

Meals.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Meals.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Meals.schema = new SimpleSchema({
  SKU: {
    type: String,
    label: 'SKU of the item',
  },
  title: {
    type: String,
    label: 'The title of the meal.',
  },
  createdAt: {
    type: String,
    label: 'The date this meal was created.',
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
    label: 'The date this type was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
    },
  },

});

Meals.attachSchema(Meals.schema);

export default Meals;
