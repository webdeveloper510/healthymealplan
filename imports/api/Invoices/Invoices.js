/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Invoices = new Mongo.Collection('Invoices');

Invoices.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Invoices.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Invoices.schema = new SimpleSchema({
  subscriptionId: {
    type: String,
    label: 'The subscription id',
  },

  lineItems: {
    type: Array,
    label: 'This will contain each profiles` line items',
    blackbox: true,
  },

  'lineItems.$': {
    type: Object,
    label: 'Each profile line item data',
    blackbox: true,
  },

  // "subscriptionItems.$.lifestyle": {
  //   type: Object,
  //   label: "lifestyle"
  // },

  // "subscriptionItems.$.lifestyle.title": {
  //   type: String,
  //   label: "lifestyle"
  // },

  // "subscriptionItems.$.lifestyle.meals:": {
  //   type: Number,
  //   label: "lifestyle"
  // },

  // "subscriptionItems.$.lifestyle.price:": {
  //   type: Number,
  //   label: "lifestyle"
  // },

  // "subscriptionItems.$.extraAthletic:": {
  //   type: Object,
  //   label: "lifestyle",
  //   optional: true
  // },

  // "subscriptionItems.$.extraBodybuilder:": {
  //   type: Object,
  //   label: "lifestyle",
  //   optional: true
  // },

  // "subscriptionItems.$.restrictions:": {
  //   type: Array,
  //   label: "lifestyle"
  // },

  // "subscriptionItems.$.deliveryCost:": {
  //   type: Number,
  //   label: "lifestyle",
  //   optional: true
  // },

  // "subscriptionItems.$.taxes:": {
  //   type: Number,
  //   label: "lifestyle",
  //   optional: true
  // },

  // "subscriptionItems.$.taxExempt:": {
  //   type: Number,
  //   label: "lifestyle",
  //   optional: true
  // },

  // "subscriptionItems.$.total:": {
  //   type: Number,
  //   label: "lifestyle",
  //   optional: true
  // },

  createdAt: {
    type: String,
    label: 'The date this subscription was created.',
    autoValue() {
      if (this.isInsert) return new Date().toISOString();
    },
  },
  updatedAt: {
    type: String,
    label: 'The date this subscription was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return new Date().toISOString();
    },
  },
});

Invoices.attachSchema(Invoices.schema);

export default Invoices;
