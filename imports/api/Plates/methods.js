import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Plates from './Plates';
import rateLimit from '../../modules/rate-limit';

import { getNextSequence } from '../../modules/server/get-next-sequence';

Meteor.methods({
  'plates.insert': function platesInsert(plate) {
    check(plate, {
      title: String,
      subtitle: String,
      mealType: String,
      ingredients: Array,
    });

    console.log(plate);

    console.log('Reaching here');

    const existingPlate = Plates.findOne({ title: plate.title });
    console.log(existingPlate);

    if (existingPlate) {
      throw new Meteor.Error('500', `${plate.title} is already present`);
    }

    let nextSeqItem = getNextSequence('plates');
    nextSeqItem = nextSeqItem.toString();

    try {
      return Plates.insert({
        SKU: nextSeqItem,
        title: plate.title,
        subtitle: plate.subtitle,
        ingredients: plate.ingredients,
        mealType: plate.mealType,
        createdBy: this.userId,
      });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'plates.update': function platesUpdate(plate) {
    check(plate, {
      _id: String,
      title: String,
      subtitle: String,
      mealType: String,
      ingredients: Array,
    });

    // check(plate.ingredients, {
    //   _id: String,
    //   title: String,
    // });

    console.log(plate);

    try {
      const plateId = plate._id;

      Plates.update(plateId, {
        $set: {
          ...plate,
        },
      });

      return plateId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'plates.updateImageId': function platesUpdate(plate) {
    check(plate, {
      _id: String,
      imageId: String,
    });

    try {
      const plateId = plate._id;

      Plates.update(plateId, {
        $set: {
          imageId: plate.imageId,
        },
      });

      return plateId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'plates.remove': function platesRemove(plateId) {
    check(plateId, String);

    try {
      return Plates.remove(plateId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'plates.batchRemove': function platesBatchRemove(plateIds) {
    check(plateIds, Array);
    console.log('Server: plates.batchRemove');

    try {
      return Plates.remove({ _id: { $in: plateIds } });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },


});

rateLimit({
  methods: [
    'plates.insert',
    'plates.update',
    'plates.remove',
    'plates.batchRemove',
    'plates.updateImageId',
  ],
  limit: 5,
  timeRange: 1000,
});
