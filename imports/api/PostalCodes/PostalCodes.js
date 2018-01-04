/* eslint-disable consistent-return */

import { Mongo } from "meteor/mongo";
import SimpleSchema from "simpl-schema";

const PostalCodes = new Mongo.Collection("PostalCodes");

PostalCodes.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

PostalCodes.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

PostalCodes.schema = new SimpleSchema({
  title: {
    type: String,
    label: "Postal code."
  },
  city: {
    type: String,
    label: "City of the postal code"
  },
  route: {
    type: String,
    label: "Route of the postal code"
  },
  limited: {
    type: Boolean,
    label: "Limited coverage for this postal code"
  },
  extraSurcharge: {
    type: Number,
    label: "Postal code surcharge",
    optional: true
  },

  extraSurchargeType: {
    type: String,
    label: "Percentage or Fixed amount",
    optional: true
  },
  createdAt: {
    type: String,
    label: "The date this category was created.",
    autoValue() {
      if (this.isInsert) return new Date().toISOString();
    }
  },
  updatedAt: {
    type: String,
    label: "The date this category was last updated.",
    autoValue() {
      if (this.isInsert || this.isUpdate) return new Date().toISOString();
    }
  }
});

PostalCodes.attachSchema(PostalCodes.schema);

export default PostalCodes;
