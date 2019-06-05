import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import { Random } from 'meteor/random';

import GiftCards from './GiftCards';
import Subscriptions from '../Subscriptions/Subscriptions';
import Jobs from '../Jobs/Jobs';
import rateLimit from '../../modules/rate-limit';


import moment from 'moment';

Meteor.methods({
  'giftcards.insert': function giftCardsInsert(giftCard) {
    console.log(giftCard);

    check(giftCard, {
      code: String,
      codeType: String,
      initialAmountPreset: Match.OneOf(String, Number),
      initialAmount: Match.OneOf(String, Number),

      customerType: String,
      customer: String,

      status: String,
      note: Match.Optional(String),
    });

    console.log(giftCard);

    const giftCardExists = GiftCards.findOne({ code: giftCard.code });

    if (giftCardExists) {
      throw new Meteor.Error('500', `${giftCard.code} is already present`);
    }

    const toInsert = {
      ...giftCard,
      balance: parseFloat(giftCard.initialAmount),
      isDepleted: false,
      purchasedOnline: false,
    };

    try {
      const inserted = GiftCards.insert(toInsert);

      return inserted;
    } catch (exception) {
      console.log(exception);
      throw new Meteor.Error('500', exception);
    }
  },

  'giftcards.update': function giftCardsUpdate(giftCard) {
    check(giftCard, {
      _id: String,
      code: String,
      codeType: String,
      initialAmountPreset: Match.OneOf(String, Number),
      initialAmount: Match.OneOf(String, Number),
      balance: Match.OneOf(String, Number),

      customerType: Match.Optional(String),
      customer: Match.Optional(String),

      status: String,
      note: Match.Optional(String),
    });

    const existingGiftCard = GiftCards.findOne({ _id: giftCard._id });

    if (existingGiftCard) {
      if (existingGiftCard.code != giftCard.code && GiftCards.findOne({ code: giftCard.code })) {
        throw new Meteor.Error('500', `${giftCard.code} is already present`);
      }
    }

    try {
      const updated = GiftCards.update({ _id: giftCard._id }, { $set: { ...giftCard } });

      return giftCard._id;
    } catch (exception) {
      console.log(exception);
      throw new Meteor.Error('500', exception);
    }
  },

  'giftcards.remove': function giftCardsRemove(giftCardId) {
    check(giftCardId, String);

    try {
      const removed = GiftCards.remove(giftCardId);

      return removed;
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'giftcards.enable': function giftCardsEnable(giftCardId) {
    check(giftCardId, String);

    const updated = GiftCards.update({ _id: giftCardId }, { $set: { status: 'active' } });

    return updated;
  },

  'giftcards.disable': function giftCardsDisable(giftCardId) {
    check(giftCardId, String);

    const giftCard = GiftCards.findOne({ _id: giftCardId });

    const updated = GiftCards.update({ _id: giftCardId }, { $set: { status: 'disabled' } });

    return updated;
  },


  'giftcards.addToCustomer': function verifyDiscountCode(giftCardDetails) {
    check(giftCardDetails, {
      code: String,
      customerId: String,
    });

    const giftCard = GiftCards.findOne({ code: giftCardDetails.code });

    if (giftCard) {

      if (giftCard.customerType == "specific" && giftCard.customer) {
        throw new Meteor.Error(500, 'Gift card is already in use.')
      }

    }

    const subscription = Subscriptions.findOne({ customerId: giftCardDetails.customerId })

    try {
      Subscriptions.update({ _id: subscription._id }, {
        $set: {
          giftCardApplied: giftCard._id,
        }
      });

      GiftCards.update({
        _id: giftCard._id
      }, {
          $set: {
            customerType: 'specific',
            customer: subscription.customerId,
          }
        })
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(500, 'There was a problem assigning gift cards');
    }

    return true;
  },
});

rateLimit({
  methods: [
    'giftcards.insert',
    'giftcards.update',
    'giftcards.remove',
    'giftcards.verify',
  ],
  limit: 5,
  timeRange: 1000,
});
