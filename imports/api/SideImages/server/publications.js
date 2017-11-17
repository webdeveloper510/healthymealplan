import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';


import SideImages from '../SideImages';

Meteor.publish('sideImages.all', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return SideImages.find(selector, options).cursor;
});

Meteor.publish('sideImages.single', (plateId) => {
  check(plateId, String);
  return SideImages.find({ plateId }).cursor;
});

