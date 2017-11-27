import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';

import Sides from './Sides';
import rateLimit from '../../modules/rate-limit';

import { getNextSequence } from '../../modules/server/get-next-sequence';

Meteor.methods({
  'sides.insert': function sidesInsert(side) {
    check(side, {
      title: String,
      subtitle: String,
      mealType: String,
      instructionId: Match.Maybe(String),
      ingredients: Array,
    });

    console.log(side);

    console.log('Reaching here');

    const existingSide = Sides.findOne({ title: side.title });
    console.log(existingSide);

    if (existingSide) {
      throw new Meteor.Error('500', `${side.title} is already present`);
    }

    let nextSeqItem = getNextSequence('sides');
    nextSeqItem = nextSeqItem.toString();

    const plateToInsert = {
      SKU: nextSeqItem,
      title: side.title,
      subtitle: side.subtitle,
      ingredients: side.ingredients,
      mealType: side.mealType,
      createdBy: this.userId,
    };

    if (side.instructionId) {
      plateToInsert.instructionId = side.instructionId;
    }

    try {
      return Sides.insert(plateToInsert);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'sides.update': function sidesUpdate(side) {
    check(side, {
      _id: String,
      title: String,
      subtitle: String,
      mealType: String,
      instructionId: Match.Maybe(String),
      ingredients: Array,
    });

    const keysToUnset = {};

    if (!side.instructionId) {
      keysToUnset.instructionId = '';
    }

    try {
      const sideId = side._id;

      Sides.update(sideId, {
        $unset: keysToUnset,
        $set: {
          ...side,
        },
      });

      return sideId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'sides.updateImageId': function sidesUpdate(side) {
    check(side, {
      _id: String,
      imageId: String,
    });

    try {
      const sideId = side._id;

      Sides.update(sideId, {
        $set: {
          imageId: side.imageId,
        },
      });

      return sideId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'sides.remove': function sidesRemove(sideId) {
    check(sideId, String);

    try {
      return Sides.remove(sideId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'sides.batchRemove': function sidesBatchRemove(sideIds) {
    check(sideIds, Array);
    console.log('Server: sides.batchRemove');

    try {
      return Sides.remove({ _id: { $in: sideIds } });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'sides.insert',
    'sides.update',
    'sides.remove',
    'sides.batchRemove',
    'sides.updateImageId',
  ],
  limit: 5,
  timeRange: 1000,
});
