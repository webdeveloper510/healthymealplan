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
  completeSchedule: {
    type: Array,
    label: 'Complete shcedule of the subscription',
  },
  'completeSchedule.$': {
    type: Object,
  },
  'completeSchedule.$.breakfast': {
    type: Number,
  },
  'completeSchedule.$.lunch': {
    type: Number,
  },
  'completeSchedule.$.dinner': {
    type: Number,
  },
  'completeSchedule.$.chefsChoiceBreakfast': {
    type: Number,
  },
  'completeSchedule.$.chefsChoiceLunch': {
    type: Number,
  },
  'completeSchedule.$.chefsChoiceDinner': {
    type: Number,
  },
  'completeSchedule.$.sides': {
    type: Number,
    blackbox: true,
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

  discountApplied: {
    type: String,
    label: 'The id of the discount applied to the subscription',
    optional: true,
  },

  giftCardApplied: {
    type: String,
    label: 'The id of the gift card applied to the subscription',
    optional: true,
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

  deliveryAssignedTo: {
    type: String,
    label: "Delivery personnel",
    optional: true,
    defaultValue: 'unassigned',
  },

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
