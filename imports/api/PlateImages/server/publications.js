import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';


import PlateImages from '../PlateImages';

Meteor.publish('plateImages.all', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return PlateImages.find(selector, options).cursor;
});

Meteor.publish('plateImages.single', (plateId) => {
  check(plateId, String);
  return PlateImages.find({ plateId }).cursor;
});

