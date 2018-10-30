/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const GiftCards = new Mongo.Collection('GiftCards');

GiftCards.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

GiftCards.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

GiftCards.schema = new SimpleSchema({

  code: {
    type: String,
    label: 'The gift code.',
  },

  codeType: {
    type: String,
    label: 'Type of gift code',
  },

  customerType: {
    type: String,
    label: 'Existing or email customer',
  },

  customer: {
    type: String,
    label: 'Existing customer who owns this gift card',
    optional: true,
  },

  subscriptionId: {
    type: String,
    label: 'subscription of the customer who owns this gift card',
    optional: true,
  },

  initialAmountPreset: {
    type: String,
    label: "Preset value identifier",
  },

  initialAmount: {
    type: Number,
    label: 'Initial value of the gift card',
  },

  balance: {
    type: Number,
    label: 'The current balance of the gift card',
  },

  isDepleted: {
    type: Boolean,
    label: 'If the gift card balance is 0',
  },

  note: {
    type: String,
    label: 'Note that cannot be seen by the customers',
    optional: true,
  },

  purchasedOnline: {
    type: Boolean,
    label: "If the card was purchased online",
  },

  activationDate: {
    type: Date,
    label: 'The date when the gift card was activated',
    optional: true,
  },

  balanceDepletionDate: {
    type: Date,
    label: 'The date when the gift card depleted',
    optional: true,
  },

  usageHistory: {
    type: Array,
    label: 'Array of dates and amount deducted along with part card transactions',
    blackbox: true,
    optional: true,
  },

  status: {
    type: String,
    label: 'Status of the gift card.',
  },

  createdAt: {
    type: String,
    label: 'The date this discount was created.',
    autoValue() {
      if (this.isInsert) return (new Date()).toISOString();
    },
  },
  updatedAt: {
    type: String,
    label: 'The date this discount was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
    },
  },

});

GiftCards.attachSchema(GiftCards.schema);

export default GiftCards;
