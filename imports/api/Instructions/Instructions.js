/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Instructions = new Mongo.Collection('Instructions');

Instructions.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Instructions.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Instructions.schema = new SimpleSchema({

  title: {
    type: String,
    label: 'The title of the instruction.',
  },

  description: {
    type: String,
    label: 'Type _id of the instruction.',
  },

  createdAt: {
    type: String,
    label: 'The date this instruction was created.',
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
    label: 'The date this instruction was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
    },
  },


});

Instructions.attachSchema(Instructions.schema);

export default Instructions;
