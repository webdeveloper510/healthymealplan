import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { check } from 'meteor/check';
import Lifestyles from './Lifestyles';
import rateLimit from '../../modules/rate-limit';
import { getNextSequence } from '../../modules/server/get-next-sequence';

Meteor.methods({
  'lifestyles.insert': function lifestylesInsert(lifestyle) {
    check(lifestyle, {
      title: String,
      restrictions: Array,
      prices: Object,
      discountAthletic: Match.Maybe(Number),
      extraAthletic: Match.Maybe(Number),
      discountOrExtraTypeAthletic: Match.Maybe(String),
      discountStudent: Match.Maybe(Number),
      extraStudent: Match.Maybe(Number),
      discountOrExtraTypeStudent: Match.Maybe(String),
      discountSenior: Match.Maybe(Number),
      extraSenior: Match.Maybe(Number),
      discountOrExtraTypeSenior: Match.Maybe(String),
    });

    check(lifestyle.prices, {
      breakfast: [Number],
      lunch: [Number],
      dinner: [Number],
    });


    const existsLifestyle = Lifestyles.findOne({ title: lifestyle.title });

    if (existsLifestyle) {
      throw new Meteor.Error('500', `${lifestyle.title} is already present`);
    }

    let nextSeqItem = getNextSequence('lifestyles');
    nextSeqItem = nextSeqItem.toString();

    const lifestyleToInsert = {
        SKU: nextSeqItem,
        ...lifestyle,
        owner: this.userId,
    };

    try {
      return Lifestyles.insert(lifestyleToInsert);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'lifestyles.update': function lifestylesUpdate(lifestyle) {
    check(lifestyle, {
      _id: String,
      title: String,
      restrictions: Array,
      prices: Object,
      discountAthletic: Match.Maybe(Number),
      extraAthletic: Match.Maybe(Number),
      discountOrExtraTypeAthletic: Match.Maybe(String),
      discountStudent: Match.Maybe(Number),
      extraStudent: Match.Maybe(Number),
      discountOrExtraTypeStudent: Match.Maybe(String),
      discountSenior: Match.Maybe(Number),
      extraSenior: Match.Maybe(Number),
      discountOrExtraTypeSenior: Match.Maybe(String),
    });

    let keysToUnset = {};

    if(!lifestyle.hasOwnProperty('extraAthletic') && !lifestyle.hasOwnProperty('discountOrExtraTypeAthletic')){
      keysToUnset.extraAthletic = '';
      keysToUnset.discountOrExtraTypeAthletic = '';
    }

    if(!lifestyle.hasOwnProperty('discountStudent') && !lifestyle.hasOwnProperty('discountOrExtraTypeStudent')){
      keysToUnset.discountStudent = '';
      keysToUnset.discountOrExtraTypeStudent = '';
    }

    if(!lifestyle.hasOwnProperty('discountSenior') && !lifestyle.hasOwnProperty('discountOrExtraTypeSenior')){
      keysToUnset.discountSenior = '';
      keysToUnset.discountOrExtraTypeSenior = '';
    }
  
    check(lifestyle.prices, {
      breakfast: [Number],
      lunch: [Number],
      dinner: [Number],
    });
    
    try {
      const lifestyleId = lifestyle._id;
      Lifestyles.update(lifestyleId, { $unset: keysToUnset, $set: lifestyle });
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
