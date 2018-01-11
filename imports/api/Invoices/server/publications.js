import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import Invoices from '../Invoices';

Meteor.publish('invoices', () => Invoices.find());

// Note: IngredientTypes.view is also used when editing an existing document.
Meteor.publish('invoices.view', (subId) => {
  check(subId, String);

  return Invoices.find({ _id: subId });
});

Meteor.publish('invoices-all-count', function categoryCount() {
  Counts.publish(this, 'invoices', Invoices.find());
});
