/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Discounts = new Mongo.Collection('Discounts');

Discounts.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Discounts.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Discounts.schema = new SimpleSchema({

  title: {
    type: String,
    label: 'The title of the discount.',
  },
  discountType: {
    type: String,
    label: 'The type of the discount, percentage or fixed amount',
  },
  discountValue: {
    type: String,
    label: 'The type of the discount, percentage or fixed amount',
  },
  appliesToType: {
    type: String,
    label: 'Entire order, specific plans',
  },
  appliesToValue: {
    type: String,
    label: '',
  },
  appliesToRestrictionsAndExtras: {
    type: Boolean,
    label: 'If restrictions and extras are included in discount price off',
  },
  appliesToExistingDiscounts: {
    type: Boolean,
    label: 'If existing discounts are taken into account before applying the discount',
  },
  minimumRequirementType: {
    type: String,
    label: 'None, minimum purchase amount or min quantity of items',
  },
  minimumRequirementValue: {
    type: String,
    label: '',
    optional: true,
  },
  customerEligibilityType: {
    type: String,
    label: 'Applies to everyone or a specific customer',
  },
  customerEligibilityValue: {
    type: SimpleSchema.oneOf(Array, String),
    label: 'Customer eligibility value',
    optional: true,
  },
  'customerEligibilityValue.$': {
    type: String,
  },
  usageLimitType: {
    type: String,
    label: 'Single use per customer or multi-use',
    optional: true,
  },
  usageLimitValue: {
    type: String,
    label: 'Single use per customer or multi-use value',
    optional: true,
  },
  status: {
    type: String,
    label: 'Current status of the discount code.',
  },
  startDate: {
    type: Date,
    label: 'Start date of the discount code',
  },
  endDate: {
    type: Date,
    label: 'End date of the discount code',
    optional: true,
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

Discounts.attachSchema(Discounts.schema);

export default Discounts;
