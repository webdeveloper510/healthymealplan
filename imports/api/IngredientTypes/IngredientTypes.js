/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const IngredientTypes = new Mongo.Collection('IngredientTypes');

IngredientTypes.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

IngredientTypes.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

IngredientTypes.schema = new SimpleSchema({
  title: {
    type: String,
    label: 'The title of the ingredient.',
  },
  createdAt: {
    type: String,
    label: 'The date this type was created.',
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

IngredientTypes.attachSchema(IngredientTypes.schema);

export default IngredientTypes;
