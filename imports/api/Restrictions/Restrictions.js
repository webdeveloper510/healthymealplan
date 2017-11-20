/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Restrictions = new Mongo.Collection('Restrictions');

Restrictions.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Restrictions.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Restrictions.schema = new SimpleSchema({
  SKU: {
    type: String,
    label: 'The SKU of the ',
  },
  title: {
    type: String,
    label: 'The title of the category.',
  },
  categories: {
    type: Array,
    label: 'The categories that belong to this category',
  },
  'categories.$': {
    type: String,
    label: 'The id of each type',
  },
  types: {
    type: Array,
    
    label: 'The types that belong to this category',
  },
  'types.$': {
    type: String,
    label: 'The id of each type',
  },
  discount: {
    type: Number,
    label: 'The amount of discount',
    optional: true,
  },
  extra: {
    type: Number,
    label: 'The amount of extra',
    optional: true,
  },
  discountOrExtraType: {
    type: String,
    label: 'Percentage or Fixed amount',
    optional: true,
  },
  restrictionType: {
    type: 'String',
    label: 'The type of restriction itself.',
  },
  owner: {
    type: String,
    label: 'The ID of the user this category belongs to.',
  },
  createdAt: {
    type: String,
    label: 'The date this category was created.',
    autoValue() {
      if (this.isInsert) return (new Date()).toISOString();
    },
  },
  updatedAt: {
    type: String,
    label: 'The date this category was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
    },
  },

});

Restrictions.attachSchema(Restrictions.schema);

export default Restrictions;
