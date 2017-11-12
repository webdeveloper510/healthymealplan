import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Lifestyles from './Lifestyles';
import rateLimit from '../../modules/rate-limit';
import { getNextSequence } from '../../modules/server/get-next-sequence';

Meteor.methods({
  'lifestyles.insert': function lifestylesInsert(lifestyle) {
    check(lifestyle, {
      title: String,
      restrictions: Array,
    });

    const existsLifestyle = Lifestyles.findOne({ title: lifestyle.title });

    if (existsLifestyle) {
      throw new Meteor.Error('500', `${lifestyle.title} is already present`);
    }

    let nextSeqItem = getNextSequence('lifestyles');
    nextSeqItem = nextSeqItem.toString();

    try {
      return Lifestyles.insert({ SKU: nextSeqItem, title: lifestyle.title, restrictions: lifestyle.types, owner: this.userId });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'lifestyles.update': function lifestylesUpdate(lifestyle) {
    check(lifestyle, {
      _id: String,
      title: String,
      restrictions: Array,
    });

    try {
      const lifestyleId = lifestyle._id;
      Lifestyles.update(lifestyleId, { $set: lifestyle });
      return lifestyleId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'lifestyles.remove': function lifestylesRemove(lifestyleId) {
    check(lifestyleId, String);

    try {
      return Lifestyles.remove(lifestyleId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'lifestyles.batchRemove': function lifestylesBatchRemove(lifestyleIds) {
    check(lifestyleIds, Array);
    console.log('Server: lifestyles.batchRemove');

    try {
      return Lifestyles.remove({ _id: { $in: lifestyleIds } });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'lifestyles.insert',
    'lifestyles.update',
    'lifestyles.remove',
    'lifestyles.batchRemove',
  ],
  limit: 5,
  timeRange: 1000,
});
