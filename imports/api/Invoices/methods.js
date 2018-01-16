import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import Invoices from "./Invoices";
import rateLimit from "../../modules/rate-limit";

Meteor.methods({
  "invoice.insert": function invoiceInsert(sub) {
    check(sub, {
      customerId: String
    });

    const subExists = Invoices.findOne({ customerId: sub.title });

    if (subExists) {
      throw new Meteor.Error(
        "500",
        `Invoice for customer ${sub.customerId} is already present`
      );
    }

    try {
      return Invoices.insert({
        paymentMethod: sub.title,
        types: sub.types
      });
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
  },

  "invoices.update": function invoicesUpdate(sub) {
    check(sub, {
      _id: String,
      customerId: String,
      types: Array
    });

    try {
      const subId = sub._id;
      Invoices.update(subId, { $set: sub });
      return subId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
  },
  "invoices.remove": function invoicesRemove(subId) {
    check(subId, String);

    try {
      return Invoices.remove(subId);
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
  }
});

rateLimit({
  methods: ["invoices.insert", "invoices.update", "invoices.remove"],
  limit: 5,
  timeRange: 1000
});
