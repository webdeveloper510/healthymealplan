import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Categories from './Categories';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'categories.insert': function categoriesInsert(cat) {
    check(cat, {
      title: String,
      types: Array,
    });

    try {
      return Categories.insert({ owner: this.userId, ...cat });
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
});

rateLimit({
  methods: [
    'categories.insert',
    'categories.update',
    'categories.remove',
  ],
  limit: 5,
  timeRange: 1000,
});
