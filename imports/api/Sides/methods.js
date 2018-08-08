import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';

import Sides from './Sides';
import rateLimit from '../../modules/rate-limit';

import slugify from 'slugify';

import { getNextSequence } from '../../modules/server/get-next-sequence';

Meteor.methods({
  'sides.insert': function sidesInsert(side) {
    check(side, {
      title: String,
      subtitle: String,
      mealType: String,
      description: Match.Optional(String),
      allergens: Match.Optional(Array),
      generatedTags: Match.Optional(Array),
      custom: Match.Optional(Boolean),
      instructionId: Match.Optional(String),
      ingredients: Array,
      nutritional: Object,
    });

    check(side.nutritional, {
      regular: Object,
      athletic: Object,
      bodybuilder: Object,
    });

    check(side.nutritional.regular, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    check(side.nutritional.athletic, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    check(side.nutritional.bodybuilder, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    // console.log(side);

    // console.log('Reaching here');

    const existingSide = Sides.findOne({ title: side.title });
    // console.log(existingSide);

    if (existingSide) {
      throw new Meteor.Error('500', `${side.title} is already present`);
    }

    let nextSeqItem = getNextSequence('sides');
    nextSeqItem = nextSeqItem.toString();

    const plateToInsert = {
      ...side,
      SKU: nextSeqItem,
      createdBy: this.userId,
    };

    if (side.hasOwnProperty('instructionId')) {
      plateToInsert.instructionId = side.instructionId;
    }

    if (side.hasOwnProperty('generatedTags')) {
      plateToInsert.generatedTags = side.generatedTags;
    }

    if (plateToInsert.subtitle.length > 0) {
      const slug = `${side.title} ${side.subtitle}`;
      plateToInsert.slug = slugify(slug, { lower: true });
    } else {
      const slug = `${side.title}`;
      plateToInsert.slug = slugify(slug, { lower: true });
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
      description: Match.Optional(String),
      allergens: Match.Optional(Array),
      generatedTags: Match.Optional(Array),
      custom: Match.Optional(Boolean),
      instructionId: Match.Optional(String),
      ingredients: Array,
      nutritional: Object,
    });

    check(side.nutritional, {
      regular: Object,
      athletic: Object,
      bodybuilder: Object,
    });

    check(side.nutritional.regular, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    check(side.nutritional.athletic, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    check(side.nutritional.bodybuilder, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    const keysToUnset = {};


    if (!side.hasOwnProperty('instructionId')) {
      keysToUnset.instructionId = '';
    }

    if (side.subtitle.length > 0) {
      const slug = `${side.title} ${side.subtitle}`;
      side.slug = slugify(slug, { lower: true });
    } else {
      const slug = `${side.title}`;
      side.slug = slugify(slug, { lower: true });
    }

    if (!side.hasOwnProperty('generatedTags')) {
      keysToUnset.generatedTags = '';
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

  'sides.updateImageUrl': function sidesUpdate(side) {
    check(side, {
      _id: String,
      imageUrl: String,
      large: Boolean,
    });

    try {
      const sideId = side._id;

      const toSet = {};

      if (side.large) {
        toSet.largeImageUrl = side.imageUrl;
      } else {
        toSet.imageUrl = side.imageUrl;
      }

      Sides.update(sideId, {
        $set: toSet,
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
