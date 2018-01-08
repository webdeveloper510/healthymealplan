import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
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
      custom: Boolean,
      instructionId: Match.Maybe(String),
      ingredients: Array,
      nutritional: Object,
    });

    check(plate.nutritional, {
      regular: Object,
      athletic: Object,
      bodybuilder: Object,
    });

    check(plate.nutritional.regular, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    check(plate.nutritional.athletic, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    check(plate.nutritional.bodybuilder, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    console.log(plate);

    // console.log("Reaching here");

    const existingPlate = Plates.findOne({ title: plate.title });

    if (existingPlate) {
      throw new Meteor.Error('500', `${plate.title} is already present`);
    }

    let nextSeqItem = getNextSequence('plates');
    nextSeqItem = nextSeqItem.toString();

    const plateToInsert = {
      SKU: nextSeqItem,
      title: plate.title,
      subtitle: plate.subtitle,
      ingredients: plate.ingredients,
      mealType: plate.mealType,
      custom: plate.custom,
      createdBy: this.userId,
      nutritional: plate.nutritional,
    };

    if (plate.instructionId) {
      plateToInsert.instructionId = plate.instructionId;
    }

    try {
      return Plates.insert(plateToInsert);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'plates.update': function platesUpdate(plate) {
    check(plate, {
      _id: String,
      title: String,
      subtitle: String,
      instructionId: Match.Maybe(String),
      mealType: String,
      custom: Boolean,
      ingredients: Array,
      nutritional: Object,
    });

    check(plate.nutritional, {
      regular: Object,
      athletic: Object,
      bodybuilder: Object,
    });

    check(plate.nutritional.regular, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    check(plate.nutritional.athletic, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    check(plate.nutritional.bodybuilder, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    const keysToUnset = {};

    if (!plate.instructionId) {
      keysToUnset.instructionId = '';
    }

    console.log(plate);

    try {
      const plateId = plate._id;

      Plates.update(plateId, {
        $unset: keysToUnset,
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
