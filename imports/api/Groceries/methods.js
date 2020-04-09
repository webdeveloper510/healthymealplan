import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';

import Groceries from './Groceries';
import rateLimit from '../../modules/rate-limit';

import slugify from 'slugify';

import { getNextSequence } from '../../modules/server/get-next-sequence';

Meteor.methods({
  'groceries.insert': function groceriesInsert(grocery) {
    check(grocery, {
      title: String,
      subtitle: String,
      mealType: String,
      description: Match.Optional(String),
      allergens: Match.Optional(Array),
      nutritional: Object,
      variants: Array,
    });

    check(grocery.nutritional, {
      regular: Object,
      athletic: Object,
      bodybuilder: Object,
    });

    check(grocery.nutritional.regular, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    check(grocery.nutritional.athletic, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    check(grocery.nutritional.bodybuilder, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    // console.log(grocery);

    // console.log('Reaching here');
    const existingSide = Groceries.findOne({ title: grocery.title });
    // console.log(existingSide);

    if (existingSide) {
      throw new Meteor.Error('500', `${grocery.title} is already present`);
    }

    let nextSeqItem = getNextSequence('groceries');
    nextSeqItem = nextSeqItem.toString();

    const plateToInsert = {
      ...grocery,
      SKU: nextSeqItem,
      createdBy: this.userId,
    };

    if (plateToInsert.subtitle.length > 0) {
      const slug = `${grocery.title} ${grocery.subtitle}`;
      plateToInsert.slug = slugify(slug, { remove: /[*+~.,()'"!:@]/g, lower: true });
    } else {
      const slug = `${grocery.title}`;
      plateToInsert.slug = slugify(slug, { remove: /[*+~.,()'"!:@]/g, lower: true });
    }

    plateToInsert.title = plateToInsert.title.toLowerCase();
    plateToInsert.subtitle = plateToInsert.subtitle.toLowerCase();

    plateToInsert.title = plateToInsert.title.replace(/&/gm, 'and');
    plateToInsert.subtitle = plateToInsert.subtitle.replace(/&/gm, 'and');

    plateToInsert.title = plateToInsert.title.split(" ").map((e) => (e == "with" || e == "and" || e == 'in') ? e : e.charAt(0).toUpperCase() + e.slice(1)).join(" ");
    plateToInsert.subtitle = plateToInsert.subtitle.split(" ").map((e) => (e == "with" || e == "and" || e == 'in') ? e : e.charAt(0).toUpperCase() + e.slice(1)).join(" ");

    try {
      return Groceries.insert(plateToInsert);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'groceries.update': function groceriesUpdate(grocery) {
    console.log(grocery);
    check(grocery, {
      _id: String,
      title: String,
      subtitle: String,
      mealType: String,
      description: Match.Optional(String),
      allergens: Match.Optional(Array),
      nutritional: Object,
      variants: Array,
    });

    check(grocery.nutritional, {
      regular: Object,
      athletic: Object,
      bodybuilder: Object,
    });

    check(grocery.nutritional.regular, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    check(grocery.nutritional.athletic, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    check(grocery.nutritional.bodybuilder, {
      calories: String,
      proteins: String,
      carbs: String,
      fat: String,
    });

    const keysToUnset = {};

    if (grocery.subtitle.length > 0) {
      const slug = `${grocery.title} ${grocery.subtitle}`;
      grocery.slug = slugify(slug, { remove: /[*+~.,()'"!:@]/g, lower: true });
    } else {
      const slug = `${grocery.title}`;
      grocery.slug = slugify(slug, { remove: /[*+~.,()'"!:@]/g, lower: true });
    }

    grocery.title = grocery.title.toLowerCase();
    grocery.subtitle = grocery.subtitle.toLowerCase();

    grocery.title = grocery.title.replace(/&/gm, 'and');
    grocery.subtitle = grocery.subtitle.replace(/&/gm, 'and');

    grocery.title = grocery.title.split(" ").map((e) => (e == "with" || e == "and" || e == 'in') ? e : e.charAt(0).toUpperCase() + e.slice(1)).join(" ");
    grocery.subtitle = grocery.subtitle.split(" ").map((e) => (e == "with" || e == "and" || e == 'in') ? e : e.charAt(0).toUpperCase() + e.slice(1)).join(" ");


    try {
      const groceryId = grocery._id;

      Groceries.update(groceryId, {
        $unset: keysToUnset,
        $set: {
          ...grocery,
        },
      });

      return groceryId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'groceries,updateImageUrl': function sidesUpdate(grocery) {
    check(grocery, {
      _id: String,
      imageUrl: String,
      large: Boolean,
    });

    try {
      const groceryId = grocery._id;

      const toSet = {};

      if (grocery.large) {
        toSet.largeImageUrl = grocery.imageUrl;
      } else {
        toSet.imageUrl = grocery.imageUrl;
      }

      Groceries.update(groceryId, {
        $set: toSet,
      });

      return groceryId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'groceries,deleteImageUrl': function groceriesDeleteImageUrl(grocery) {
    check(grocery, {
      _id: String,
      large: Boolean,
    });

    try {
      const groceryId = grocery._id;

      const toUnset = {};

      if (grocery.large) {
        toUnset.largeImageUrl = '';
      } else {
        toUnset.imageUrl = '';
      }

      Groceries.update(groceryId, {
        $unset: toUnset,
      });

      return groceryId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'groceries,remove': function groceriesRemove(sideId) {
    check(sideId, String);

    try {
      return Groceries.remove(sideId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'groceries,batchRemove': function groceriesBatchRemove(groceryIds) {
    check(groceryIds, Array);
    console.log('Server: groceries,batchRemove');

    try {
      return Groceries.remove({ _id: { $in: groceryIds } });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'groceries,insert',
    'groceries,update',
    'groceries,remove',
    'groceries,batchRemove',
    'groceries,updateImageId',
  ],
  limit: 5,
  timeRange: 1000,
});
