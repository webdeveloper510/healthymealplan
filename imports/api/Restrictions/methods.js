import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Restrictions from './Restrictions';
import rateLimit from '../../modules/rate-limit';
import { getNextSequence } from '../../modules/server/get-next-sequence';

Meteor.methods({
  'restrictions.insert': function restrictionsInsert(restriction) {
    check(restriction, {
      title: String,
      restrictionType: String,
      types: Array,
      categories: Array,
    });

    const existsRestriction = Restrictions.findOne({ title: restriction.title });

    if (existsRestriction) {
      throw new Meteor.Error('500', `${restriction.title} is already present`);
    }

    let nextSeqItem = getNextSequence('restrictions');
    nextSeqItem = nextSeqItem.toString();

    try {
      return Restrictions.insert({ SKU: nextSeqItem,
        title: restriction.title,
        types: restriction.types,
        restrictionType: restriction.restrictionType,
        owner: this.userId,
      });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'restrictions.update': function restrictionsUpdate(cat) {
    check(cat, {
      _id: String,
      title: String,
      types: Array,
    });

    try {
      const catId = cat._id;
      Restrictions.update(catId, { $set: cat });
      return catId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'restrictions.remove': function restrictionsRemove(catId) {
    check(catId, String);

    try {
      return Restrictions.remove(catId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'restrictions.batchRemove': function restrictionsBatchRemove(ingredientIds) {
    check(ingredientIds, Array);
    console.log('Server: restrictions.batchRemove');

    try {
      return Restrictions.remove({ _id: { $in: ingredientIds } });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'restrictions.insert',
    'restrictions.update',
    'restrictions.remove',
    'restrictions.batchRemove',
  ],
  limit: 5,
  timeRange: 1000,
});
