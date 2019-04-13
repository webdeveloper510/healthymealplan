/* eslint-disable consistent-return */

import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

const Restrictions = new Mongo.Collection("Restrictions");

Restrictions.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Restrictions.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

Restrictions.schema = new SimpleSchema({
  SKU: {
    type: String,
    label: "SKU of the restriction."
  },
  title: {
    type: String,
    label: "The title of the restriction."
  },
  categories: {
    type: Array,
    label: "The categories that belong to this restriction."
  },
  "categories.$": {
    type: String,
    label: "The id of each type"
  },
  types: {
    type: Array,
    label: "The types that belong to this restriction"
  },
  "types.$": {
    type: String,
    label: "The id of each type",
      optional: true,
  },
  ingredients: {
    type: Array,
    label: "The ingredients that belong to this restriction"
  },
  "ingredients.$": {
    type: String,
    label: "The id of each ingredient",
    optional: true,
  },
  discount: {
    type: Number,
    label: "The amount of discount",
    optional: true
  },
  extra: {
    type: Number,
    label: "The amount of extra",
    optional: true
  },
  discountOrExtraType: {
    type: String,
    label: "Percentage or Fixed amount",
    optional: true
  },
  restrictionType: {
    type: "String",
    label: "The type of restriction itself."
  },
  owner: {
    type: String,
    label: "The ID of the user this restriction belongs to."
  },
  createdAt: {
    type: String,
    label: "The date this restriction was created.",
    autoValue() {
      if (this.isInsert) return new Date().toISOString();
    }
  },
  updatedAt: {
    type: String,
    label: "The date this restriction was last updated.",
    autoValue() {
      if (this.isInsert || this.isUpdate) return new Date().toISOString();
    }
  }
});

Restrictions.attachSchema(Restrictions.schema);

export default Restrictions;
