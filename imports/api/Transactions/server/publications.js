import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Match } from "meteor/check";
import Transactions from "../Transactions";

Meteor.publish("transactions", (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return Transactions.find();
});

// Note: IngredientTypes.view is also used when editing an existing document.
Meteor.publish("transactions.view", transctionId => {
  check(transctionId, String);

  return Transactions.find({ _id: transctionId });
});

Meteor.publish("transactions-all-count", function categoryCount() {
  Counts.publish(this, "transactions", Transactions.find());
});
