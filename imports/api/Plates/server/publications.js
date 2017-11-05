/* esling-disable */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';

import Plates from '../Plates';

Meteor.publish('plates', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return Plates.find(selector, options);
});


Meteor.publish('plates-all-count', function () {
  Counts.publish(this, 'plates', Plates.find());
});

// Note: Ingredients.view is also used when editing an existing document.
Meteor.publish('plates.view', (plateId) => {
  check(plateId, String);
  return Plates.find({ _id: plateId });
});
