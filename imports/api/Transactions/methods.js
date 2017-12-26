import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import Subscriptions from "./Subscriptions";
import rateLimit from "../../modules/rate-limit";
import { getNextSequence } from "../../modules/server/get-next-sequence";

Meteor.methods({
  "subscription.insert": function subscriptionInsert(sub) {
    check(sub, {
      customerId: String
    });

    const subExists = Subscriptions.findOne({ customerId: sub.title });

    if (subExists) {
      throw new Meteor.Error(
        "500",
        `Subscription for customer ${sub.customerId} is already present`
      );
    }

    try {
      return Subscriptions.insert({
        paymentMethod: sub.title,
        types: sub.types
      });
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
  },

  "subscriptions.update": function subscriptionsUpdate(sub) {
    check(sub, {
      _id: String,
      customerId: String,
      types: Array
    });

    try {
      const subId = sub._id;
      Subscriptions.update(subId, { $set: sub });
      return subId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
  },
  "subscriptions.remove": function subscriptionsRemove(subId) {
    check(subId, String);

    try {
      return Subscriptions.remove(subId);
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
  }
  // "categories.batchRemove": function categoriesBatchRemove(ingredientIds) {
  //   check(ingredientIds, Array);
  //   console.log("Server: categories.batchRemove");

  //   try {
  //     return Subscriptions.remove({ _id: { $in: ingredientIds } });
  //   } catch (exception) {
  //     throw new Meteor.Error("500", exception);
  //   }
  // }
});

rateLimit({
  methods: [
    "subscriptions.insert",
    "subscriptions.update",
    "subscriptions.remove",
    "categories.batchRemove"
  ],
  limit: 5,
  timeRange: 1000
});
