/* esling-disable */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';

import Sides from '../Sides';

Meteor.publish('sides', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return Sides.find(selector, options);
});


Meteor.publish('sides-all-count', function () {
  Counts.publish(this, 'sides', Sides.find());
});

// Note: Plates.view is also used when editing an existing plate.
Meteor.publish('sides.view', (plateId) => {
  check(plateId, String);
  return Sides.find({ _id: plateId });
});
