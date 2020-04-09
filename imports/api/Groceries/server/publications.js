/* esling-disable */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';

import Groceries from '../Groceries';

Meteor.publish('groceries', (selector, options) => {
  check(selector, Match.Any);
    check(options, Match.Any);

  return Groceries.find(selector, options);
});


Meteor.publish('groceries-all-count', function () {
  Counts.publish(this, 'groceries', Groceries.find());
});

// Note: Plates.view is also used when editing an existing plate.
Meteor.publish('groceries.view', (plateId) => {
  check(plateId, String);
  return Groceries.find({ _id: plateId });
});
