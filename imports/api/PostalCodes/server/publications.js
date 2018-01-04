import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Match } from "meteor/check";
import PostalCodes from "../PostalCodes";

Meteor.publish("postalcodes", (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return PostalCodes.find();
});

// Note: postalcodes.view is also used when editing an existing document.
Meteor.publish("postalcodes.view", postalCodeId => {
  check(postalCodeId, String);

  return PostalCodes.find({ _id: postalCodeId });
});

Meteor.publish("postalcodes-all-count", function categoryCount() {
  Counts.publish(this, "postalcodes-count", PostalCodes.find());
});
