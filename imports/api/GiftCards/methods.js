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
    // onst giftCard = {
    //   code: this.state.code.trim(),
    //   codeType: this.state.codeType,
    //   initialAmountPreset: this.state.initialAmountPreset,

    //   customerType: this.state.customerType,
    //   customer: this.state.customerType == 'specific' ? customerClone.map((e) => {
    //     const foundCustomer = this.props.customers.find(el => el._id === e);
    //     return foundCustomer._id;
    //   }) : this.state.customer,

    //   status: 'active',
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

    const existsCategory = GiftCards.findOne({ code: giftCard.code });

    if (existsCategory) {
      throw new Meteor.Error('500', `${giftCard.code} is already present`);
    }

    const currentBalance = parseFloat(giftCard.initialAmount);

    const toInsert = {
      ...giftCard,
      balance: currentBalance,
      isDepleted: false,
      purchased: false,
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
      title: String,
      discountType: String,
      discountValue: Number,

      appliesToType: String,
      appliesToValue: String,
      appliesToRestrictionsAndExtras: Boolean,
      appliesToExistingDiscounts: Match.Maybe(Boolean),

      usageLimitType: Match.Maybe(String),
      usageLimitValue: Match.Maybe(Number),

      minimumRequirementType: String,
      minimumRequirementValue: Match.OneOf(String, Number),

      customerEligibilityType: String,
      customerEligibilityValue: Match.OneOf(String, Array),

      status: String,

      startDate: Date,
      endDate: Match.Maybe(Date),
    });

    const existsDiscount = GiftCards.findOne({ _id: giftCard._id });

    if (existsDiscount) {
      if (existsDiscount.title != giftCard.title && GiftCards.findOne({ title: giftCard.title })) {
        throw new Meteor.Error('500', `${giftCard.title} is already present`);
      }
    }

    const keysToUnset = {};

    if (!giftCard.hasOwnProperty('usageLimitType')) {
      keysToUnset.usageLimitType = '';
      keysToUnset.usageLimitValue = '';
    }

    if (!giftCard.hasOwnProperty('endDate')) {
      keysToUnset.endDate = '';
    }

    if (giftCard.hasOwnProperty('appliesToExistingDiscounts')) {
      giftCard.appliesToExistingDiscounts = giftCard.appliesToExistingDiscounts;
    } else {
      giftCard.appliesToExistingDiscounts = false;
    }

    try {
      const giftCardId = giftCard._id;
      const updated = GiftCards.update({ _id: giftCardId }, { $unset: keysToUnset, $set: discount });

      if (updated) {
        if (!giftCard.hasOwnProperty('endDate')) {
          Jobs.remove({ type: 'disableDiscountJob', 'data._id': giftCardId });
        } else if (!moment(giftCard.endDate).isSame(existsDiscount.endDate, 'day')) {
          Jobs.remove({ type: 'disableDiscountJob', 'data._id': giftCardId });

          const job = new Job(Jobs, 'disableDiscountJob', { _id: giftCardId });

          job.priority('normal').after(moment(giftCard.endDate).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).toDate()).save(); // Commit it to the server
        }

        if (!moment(giftCard.startDate).isSame(existsDiscount.startDate, 'day') && moment(giftCard.startDate).isAfter(moment(), 'day')) {
          Jobs.remove({ type: 'enableDiscountJob', 'data._id': giftCardId });

          const job = new Job(
            Jobs, 'enableDiscountJob', // type of job
            { _id: giftCardId },
          );

          job.priority('normal').after(moment(giftCard.startDate).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).toDate()).save(); // Commit it to the server
        }
      }


      return giftCardId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      console.log(exception);
      throw new Meteor.Error('500', exception);
    }
  },
  'giftcards.remove': function giftCardsRemove(giftCardId) {
    check(giftCardId, String);

    try {
      const removed = GiftCards.remove(giftCardId);

      console.log(removed);

      const jobExists = Jobs.find({ 'data._id': giftCardId }).fetch();

      if (jobExists.length >= 1) {
        Jobs.remove({ _id: { $in: jobExists.map(e => e._id) } });
      }
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'giftcards.batchRemove': function giftCardsBatchRemove(giftCardIds) {
    check(giftCardIds, Array);
    console.log('Server: giftcards.batchRemove');

    try {
      const removed = GiftCards.remove({ _id: { $in: giftCardIds } });

      const jobExists = Jobs.find({ 'data._id': { $in: giftCardIds } }).fetch();

      if (jobExists.length >= 1) {
        Jobs.remove({ _id: { $in: jobExists.map(e => e._id) } });
      }
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

    const discount = GiftCards.findOne({ _id: giftCardId });

    const updated = GiftCards.update({ _id: giftCardId }, { $set: { status: 'expired' } });

    const jobExists = Jobs.find({ 'data._id': { $in: giftCardId } }).fetch();

    if (jobExists.length >= 1) {
      Jobs.remove({ _id: { $in: jobExists.map(e => e._id) } });
    }

    return updated;
  },

  'giftcards.verify': function verifyDiscountCode(discountDetails) {
    check(discountDetails, {
      discountTitle: String,
      customerId: Match.Optional(String),
    });

    const discount = GiftCards.findOne({ title: discountDetails.discountTitle });
    const discountCodeUsed = Subscriptions.find({ discountApplied: discount._id }).fetch();

    if (discount == null) {
      throw new Meteor.Error(404, 'Discount code not found');
    }

    if (discount.status != 'active') {
      throw new Meteor.Error(401, 'The discount code has been expired');
    }

    if (discount.hasOwnProperty('usageLimitType')) {
      if (discount.usageLimitType == 'numberOfTimes') {
        if (discountCodeUsed.length >= discount.usageLimitType) {
          throw new Meteor.Error(401, 'The discount code limit has been exceeded');
        }
      }
    }

    if (discountDetails.hasOwnProperty('customerId') && discountDetails.customerId != null) {
      const user = Meteor.users.findOne({ _id: discountDetails.customerId });

      if (discount.hasOwnProperty('customerEligibilityType')) {
        if (discount.customerEligibilityType == 'specific') {
          if (discount.customerEligibilityValue.findIndex(e => e == discountDetails.customerId) == -1) {
            throw new Meteor.Error(401, 'The discount code doesn\'t apply to this customer');
          }
        }
      }
    }


    return true;
  },
});

rateLimit({
  methods: [
    'giftcards.insert',
    'giftcards.update',
    'giftcards.remove',
    'giftcards.batchRemove',
    'giftcards.verify',
  ],
  limit: 5,
  timeRange: 1000,
});
