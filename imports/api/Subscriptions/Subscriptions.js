/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Subscriptions = new Mongo.Collection('Subscriptions');

Subscriptions.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Subscriptions.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Subscriptions.schema = new SimpleSchema({
  customerId: {
    type: String,
    label: 'The customer id',
  },
  delivery: {
    type: Array,
    label: 'Delivery Schedule',
  },
  'delivery.$': {
    type: String,
    label: "Day's delivery",
    optional: true,
  },
  authorizeSubscriptionId: {
    type: String,
    label: 'Authorize.Net subscriptionId (Card only)',
    optional: true,
  },
  authorizeCustomerProfileId: {
    type: String,
    label: 'Authorize.Net customer profileId',
    optional: true,
  },
  authorizePaymentProfileId: {
    type: String,
    label: 'Authorize.Net paymentProfileId (Card only)',
    optional: true,
  },
  status: {
    type: String,
    label: 'Status of the subscription',
  },

  paymentMethod: {
    type: String,
    label: 'The payment method for the subscription',
  },

  amount: {
    type: Number,
    label: 'The total amount of the subscription',
  },

  transactions: {
    type: Array,
    label: 'All the transaction ids for this subscription',
    optional: true,
  },

  // "transactions.$": {
  //   type: String,
  //   label: "The transaction id"
  // },

  taxExempt: {
    type: Boolean,
    label: 'Customer is tax exempt.',
  },

  subscriptionItems: {
    type: Array,
    label: 'This will contain each profiles` line items',
    blackbox: true,
  },

  'subscriptionItems.$': {
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

Subscriptions.attachSchema(Subscriptions.schema);

export default Subscriptions;
