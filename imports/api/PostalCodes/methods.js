import { Meteor } from "meteor/meteor";
import { Match } from "meteor/check";
import { check } from "meteor/check";
import PostalCodes from "./PostalCodes";
import rateLimit from "../../modules/rate-limit";

Meteor.methods({
  "postalCodes.insert": function postalCodesInsert(postalCode) {
    check(postalCode, {
      title: String,
      city: String,
      route: String,
      limited: Boolean,
      extraSurcharge: Match.Maybe(Number),
      extraSurchargeType: Match.Maybe(String)
    });

    const existsCategory = PostalCodes.findOne({ title: postalCode.title });

    if (existsCategory) {
      throw new Meteor.Error("500", `${postalCode.title} is already present`);
    }

    try {
      return PostalCodes.insert({
        ...postalCode
      });
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
  },

  "postalCodes.update": function postalCodesUpdate(postalCode) {
    check(postalCode, {
      _id: String,
      title: String,
      city: String,
      route: String,
      limited: Boolean,
      extraSurcharge: Match.Maybe(Number),
      extraSurchargeType: Match.Maybe(String)
    });

    const keysToUnset = {};

    if (
      !postalCode.hasOwnProperty("extraSurcharge") &&
      !postalCode.hasOwnProperty("extraSurchargeType")
    ) {
      keysToUnset.extraSurcharge = "";
      keysToUnset.extraSurchargeType = "";
    }

    try {
      const postalCodeId = postalCode._id;
      PostalCodes.update(postalCodeId, {
        $unset: keysToUnset,
        $set: postalCode
      });
      return postalCodeId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
  },
  "postalCodes.remove": function postalCodesRemove(postalCodeId) {
    check(postalCodeId, String);

    try {
      return PostalCodes.remove(postalCodeId);
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
  },
  "postalCodes.batchRemove": function postalCodesBatchRemove(postalCodeIds) {
    check(postalCodeIds, Array);
    console.log("Server: postalCodes.batchRemove");

    try {
      return PostalCodes.remove({ _id: { $in: postalCodeIds } });
    } catch (exception) {
      throw new Meteor.Error("500", exception);
    }
  }
});

rateLimit({
  methods: [
    "postalCodes.insert",
    "postalCodes.update",
    "postalCodes.remove",
    "postalCodes.batchRemove"
  ],
  limit: 5,
  timeRange: 1000
});
