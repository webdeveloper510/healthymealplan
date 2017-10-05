/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Ingredients = new Mongo.Collection('Ingredients');

Ingredients.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Ingredients.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Ingredients.schema = new SimpleSchema({
  title: {
    type: String,
    label: 'The title of the ingredient.',
  },

  ingredientType: {
    type: String,
    label: 'Type _id of the ingredient.',
    optional: true,
  },

  subIngredients: {
    type: Array,
    label: 'Sub ingredients of this ingredient.',
    optional: true,
  },

  'subIngredients.$._id': {
    type: String,
    label: '_id of the sub ingredient.',
  },

  'subIngredients.$.typeId': {
    type: String,
    label: 'Type of the sub ingredient.',
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

Ingredients.attachSchema(Ingredients.schema);

export default Ingredients;
