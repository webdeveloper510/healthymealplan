/* eslint-disable consistent-return */

import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

const Transactions = new Mongo.Collection("Transactions");

Transactions.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Transactions.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

Transactions.schema = new SimpleSchema({
  subscriptionId: {
    type: String,
    label: "The subscription id."
  },

  amount: {
    type: Number,
    label: "Amount of the transaction."
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

Transactions.attachSchema(Transactions.schema);

export default Transactions;
