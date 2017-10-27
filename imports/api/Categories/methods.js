import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Categories from './Categories';
import rateLimit from '../../modules/rate-limit';
import { getNextSequence } from '../../modules/server/get-next-sequence';

Meteor.methods({
  'categories.insert': function categoriesInsert(cat) {
    check(cat, {
      title: String,
      types: Array,
    });

    const existsCategory = Categories.findOne({ title: cat.title });

    if (existsCategory) {
      throw new Meteor.Error('500', `${cat.title} is already present`);
    }

    let nextSeqItem = getNextSequence('categories');
    nextSeqItem = nextSeqItem.toString();

    try {
      return Categories.insert({ SKU: nextSeqItem, title: cat.title, types: cat.types, owner: this.userId });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'categories.update': function categoriesUpdate(cat) {
    check(cat, {
      _id: String,
      title: String,
      types: Array,
    });

    try {
      const catId = cat._id;
      Categories.update(catId, { $set: cat });
      return catId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'categories.remove': function categoriesRemove(catId) {
    check(catId, String);

    try {
      return Categories.remove(catId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'categories.batchRemove': function categoriesBatchRemove(ingredientIds) {
    check(ingredientIds, Array);
    console.log('Server: categories.batchRemove');

    try {
      return Categories.remove({ _id: { $in: ingredientIds } });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'categories.insert',
    'categories.update',
    'categories.remove',
    'categories.batchRemove',
  ],
  limit: 5,
  timeRange: 1000,
});
