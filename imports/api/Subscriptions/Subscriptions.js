/* eslint-disable consistent-return */

import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

const Subscriptions = new Mongo.Collection("Subscriptions");

Subscriptions.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Subscriptions.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

Subscriptions.schema = new SimpleSchema({
  customerId: {
    type: String,
    label: "The customer id"
  },
  paymentMethod: {
    type: String,
    label: "The payment method for the subscription"
  },
  amount: {
    type: Number,
    label: "The total amount of the subscription"
  },

  transactions: {
    type: Array,
    label: "All the transaction ids for this subscription",
    optional: true
  },

 "transactions.$" :{
    type: String,
    label: "The transaction id";
  },

  taxExempt: {
    type: Boolean,
    label: "Customer is tax exempt."
  },

  generateReceipts: {
    type: Boolean,
    label: "Generate receipts."
  },

  createdAt: {
    type: String,
    label: "The date this subscription was created.",
    autoValue() {
      if (this.isInsert) return new Date().toISOString();
    }
  },
  updatedAt: {
    type: String,
    label: "The date this subscription was last updated.",
    autoValue() {
      if (this.isInsert || this.isUpdate) return new Date().toISOString();
    }
  }
});

Subscriptions.attachSchema(Subscriptions.schema);

export default Subscriptions;
