import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { check } from 'meteor/check';
import Plates from './Plates';
import rateLimit from '../../modules/rate-limit';
import slugify from 'slugify';


import { getNextSequence } from '../../modules/server/get-next-sequence';

Meteor.methods({
  platesInsert(plate) {
    check(plate, {
      title: String,
      subtitle: Match.Optional(String),
      description: Match.Optional(String),
      madeBy: String,
      mealCategory: String,
      substitutePlate: Match.Optional(Object),
      allergens: Match.Optional(Array),
      mealType: String,
      custom: Match.Optional(Boolean),
      instructionId: Match.Optional(String),
      generatedTags: Match.Optional(Array),
      ingredients: Array,
      nutritional: Match.Optional(Object),
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

    const existingPlate = Plates.findOne({ title: plate.title });

    if (existingPlate) {
      throw new Meteor.Error('500', `${plate.title} is already present`);
    }

    let nextSeqItem = getNextSequence('plates');
    nextSeqItem = nextSeqItem.toString();

    const plateToInsert = {
      ...plate,
      SKU: nextSeqItem,
      createdBy: this.userId,
    };

    if (plate.hasOwnProperty('instructionId')) {
      plateToInsert.instructionId = plate.instructionId;
    }

    if (plate.hasOwnProperty('substitutePlate')) {
      plateToInsert.substitutePlate = plate.substitutePlate;
    }

    if (plate.hasOwnProperty('generatedTags')) {
      plateToInsert.generatedTags = plate.generatedTags;
    }


    if (plateToInsert.subtitle.length > 0) {
      const slug = `${plate.title} ${plate.subtitle}`;
      plateToInsert.slug = slugify(slug, { lower: true });
    } else {
      const slug = `${plate.title}`;
      plateToInsert.slug = slugify(slug, { lower: true });
    }

    plateToInsert.title = plateToInsert.title.toLowerCase();
    plateToInsert.subtitle = plateToInsert.subtitle.toLowerCase();

    plateToInsert.title = plateToInsert.title.charAt(0).toUpperCase() + plateToInsert.title.slice(1);
    if (!['with', 'in', 'and'].includes(plateToInsert.subtitle.split(' ')[0])) {
      plateToInsert.subtitle = plateToInsert.subtitle.charAt(0).toUpperCase() + plateToInsert.subtitle.slice(1);
    }

    plateToInsert.title = plateToInsert.title.replace(/&/gm, 'and');
    plateToInsert.subtitle = plateToInsert.subtitle.replace(/&/gm, 'and');

    try {
      return Plates.insert(plateToInsert);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  platesUpdate(plate) {
    check(plate, {
      _id: String,
      title: String,
      subtitle: Match.Optional(String),
      description: Match.Optional(String),
      madeBy: String,
      mealCategory: String,
      allergens: Match.Optional(Array),
      substitutePlate: Match.Optional(Object),
      generatedTags: Match.Optional(Array),
      instructionId: Match.Optional(String),
      mealType: String,
      custom: Match.Optional(Boolean),
      ingredients: Array,
      nutritional: Match.Optional(Object),
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

    if (!plate.hasOwnProperty('instructionId')) {
      keysToUnset.instructionId = '';
    }

    if (!plate.hasOwnProperty('substitutePlate')) {
      keysToUnset.substitutePlate = '';
    }

    if (plate.subtitle.length > 0) {
      const slug = `${plate.title} ${plate.subtitle}`;
      plate.slug = slugify(slug, { lower: true });
    } else {
      const slug = `${plate.title}`;
      plate.slug = slugify(slug, { lower: true });
    }

    if (!plate.hasOwnProperty('generatedTags')) {
      keysToUnset.generatedTags = '';
    }

    plate.title = plate.title.toLowerCase();
    plate.subtitle = plate.subtitle.toLowerCase();

    plate.title = plate.title.replace(/&/gm, 'and');
    plate.subtitle = plate.subtitle.replace(/&/gm, 'and');

    plate.title = plate.title.charAt(0).toUpperCase() + plate.title.slice(1);

    if (!['with', 'in', 'and'].includes(plate.subtitle.split(' ')[0])) {
      plate.subtitle = plate.subtitle.charAt(0).toUpperCase() + plate.subtitle.slice(1);
    }

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

  'plates.updateImageUrl': function platesUpdateImageUrl(plate) {
    check(plate, {
      _id: String,
      imageUrl: String,
      large: Boolean,
    });

    try {
      const plateId = plate._id;

      const toSet = {};

      if (plate.large) {
        toSet.largeImageUrl = plate.imageUrl;
      } else {
        toSet.imageUrl = plate.imageUrl;
      }

      Plates.update(plateId, {
        $set: toSet,
      });

      return plateId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'plates.deleteImageUrl': function platesDeleteImageUrl(plate) {
    check(plate, {
      _id: String,
      large: Boolean,
    });

    try {
      const plateId = plate._id;

      const toUnset = {};

      if (plate.large) {
        toUnset.largeImageUrl = '';
      } else {
        toUnset.imageUrl = '';
      }

      Plates.update(plateId, {
        $unset: toUnset,
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
    'platesInsert',
    'platespdate',
    'plates.remove',
    'plates.batchRemove',
    'plates.updateImageUrl',
  ],
  limit: 5,
  timeRange: 1000,
});
