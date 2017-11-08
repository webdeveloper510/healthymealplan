import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import PlateImages from '../PlateImages';

Meteor.publish('plateImages.all', () => PlateImages.find().cursor);

Meteor.publish('plateImages.single', (plateId) => {
  check(plateId, String);
  return PlateImages.find({ plateId }).cursor;
});

