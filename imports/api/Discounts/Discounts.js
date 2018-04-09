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
    label: "The type of the discount, percentage or fixed amount",
  },
  discountValue: {
    type: String,
    label: "The type of the discount, percentage or fixed amount",
  },
  appliesToType: {
    type: String,
    label: "Entire order, specific plans",
    optional: true,
  },
  appliesToValue: {
    type: String,
    label: "",
    optional: true,
  },
  minimumRequirementType: {
    type: String,
    label: "None, minimum purchase amount or min quantity of items",
    optional: true,
  },
  minimumRequirementValue: {
    type: String,
    label: "",
    optional: true,
  },
  customerEligiblityType: {
    type: String,
    label: "Applies to everyone or a specific customer",
    optional: true,
  },
  customerEligibilityValue: {
    type: String,
    label: "",
    optional: true,
  },
  usageLimitType: {
    type: String,
    label: "Single use per customer or multi-use",
    optional: true,
  },
  usageLimitValue: {
    type: String,
    label: "Single use per customer or multi-use value",
    optional: true,
  },
  createdBy: {
    type: String,
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
