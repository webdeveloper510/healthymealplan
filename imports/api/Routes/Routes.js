/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Routes = new Mongo.Collection('Routes');

Routes.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Routes.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Routes.schema = new SimpleSchema({
  SKU: {
    type: String,
    label: 'The SKU of the ',
  },
  title: {
    type: String,
    label: 'The title of the category.',
  },
  isLimited: {
    type: Boolean,
    label: 'Limited coverage for this route',
  },
  extra: {
    typ,
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

Routes.attachSchema(Routes.schema);

export default Routes;
