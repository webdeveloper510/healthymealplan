/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Categories = new Mongo.Collection('Categories');

Categories.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Categories.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Categories.schema = new SimpleSchema({

  title: {
    type: String,
    label: 'The title of the category.',
  },
  types: {
    type: Array,
    label: 'The types that belong to this category',
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

Categories.attachSchema(Categories.schema);

export default Categories;
