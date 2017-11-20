import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
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
      discount: Match.Maybe(Number),
      extra: Match.Maybe(Number),
      discountOrExtraType: Match.Maybe(String),
    });

    const existsRestriction = Restrictions.findOne({ title: restriction.title });

    if (existsRestriction) {
      throw new Meteor.Error('500', `${restriction.title} is already present`);
    }

    let nextSeqItem = getNextSequence('restrictions');
    nextSeqItem = nextSeqItem.toString();

    const restrictionToInsert = {
      SKU: nextSeqItem,
      title: restriction.title,
      restrictionType: restriction.restrictionType,
      categories: restriction.categories,
      types: restriction.types,
      owner: this.userId,
    };

    if (restriction.discount) {
      restrictionToInsert.discount = restriction.discount;
      restrictionToInsert.discountOrExtraType = restriction.discountOrExtraType;
    } else if (restriction.extra) {
      restrictionToInsert.extra = restriction.extra;
      restrictionToInsert.discountOrExtraType = restriction.discountOrExtraType;
    }

    console.log(restrictionToInsert);

    try {
      return Restrictions.insert(restrictionToInsert);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'restrictions.update': function restrictionsUpdate(restriction) {
    check(restriction, {
      _id: String,
      title: String,
      restrictionType: String,
      types: Array,
      categories: Array,
      discount: Match.Maybe(Number),
      extra: Match.Maybe(Number),
      discountOrExtraType: Match.Maybe(String),
    });


    const restrictionToInsert = {
      title: restriction.title,
      restrictionType: restriction.restrictionType,
      categories: restriction.categories,
      types: restriction.types,
      owner: this.userId,
    };

    let keysToUnset = {};

    if (restriction.discount) {
      restrictionToInsert.discount = restriction.discount;
      restrictionToInsert.discountOrExtraType = restriction.discountOrExtraType;

      keysToUnset.extra = "";
      
    } else if (restriction.extra) {
      restrictionToInsert.extra = restriction.extra;
      restrictionToInsert.discountOrExtraType = restriction.discountOrExtraType;
      
      keysToUnset.discount = "";
      
    } else{
      keysToUnset.extra = "";
      keysToUnset.discount = "";
      keysToUnset.discountOrExtraType = "";
    }

    try {
      const restrictionId = restriction._id;
      Restrictions.update(restrictionId, { $unset: keysToUnset, $set: restriction });
      return restrictionId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'restrictions.remove': function restrictionsRemove(restrictionId) {
    check(restrictionId, String);

    try {
      return Restrictions.remove(restrictionId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'restrictions.batchRemove': function restrictionsBatchRemove(restrictionIds) {
    check(restrictionIds, Array);
    console.log('Server: restrictions.batchRemove');

    try {
      return Restrictions.remove({ _id: { $in: restrictionIds } });
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
