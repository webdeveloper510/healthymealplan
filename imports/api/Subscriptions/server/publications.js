import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Match } from "meteor/check";
import Subscriptions from "../Subscriptions";

Meteor.publish("subscriptions", function() {
  return Subscriptions.find();
});

// Note: IngredientTypes.view is also used when editing an existing document.
Meteor.publish("subscriptions.view", subId => {
  check(subId, String);

  return Subscriptions.find({ _id: subId });
});

Meteor.publish("subscriptions-all-count", function categoryCount() {
  Counts.publish(this, "subscriptions", Subscriptions.find());
});
