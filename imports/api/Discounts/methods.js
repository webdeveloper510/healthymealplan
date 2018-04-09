import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Discounts from './Discounts';
import rateLimit from '../../modules/rate-limit';
import { getNextSequence } from '../../modules/server/get-next-sequence';

Meteor.methods({
  'discounts.insert': function categoriesInsert(cat) {
    check(cat, {
      title: String,
      types: Array,
    });

    const existsCategory = Discounts.findOne({ title: cat.title });

    if (existsCategory) {
      throw new Meteor.Error('500', `${cat.title} is already present`);
    }

    let nextSeqItem = getNextSequence('categories');
    nextSeqItem = nextSeqItem.toString();

    try {
      return Discounts.insert({ SKU: nextSeqItem, title: cat.title, types: cat.types, owner: this.userId });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'discounts.update': function categoriesUpdate(cat) {
    check(cat, {
      _id: String,
      title: String,
      types: Array,
    });

    try {
      const catId = cat._id;
      Discounts.update(catId, { $set: cat });
      return catId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'discounts.remove': function categoriesRemove(catId) {
    check(catId, String);

    try {
      return Discounts.remove(catId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'discounts.batchRemove': function categoriesBatchRemove(ingredientIds) {
    check(ingredientIds, Array);
    console.log('Server: discounts.batchRemove');

    try {
      return Discounts.remove({ _id: { $in: ingredientIds } });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'discounts.insert',
    'discounts.update',
    'discounts.remove',
    'discounts.batchRemove',
  ],
  limit: 5,
  timeRange: 1000,
});
