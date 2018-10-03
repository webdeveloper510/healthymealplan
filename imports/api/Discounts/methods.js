import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import { Random } from 'meteor/random';

import Discounts from './Discounts';
import Subscriptions from '../Subscriptions/Subscriptions';
import Jobs from '../Jobs/Jobs';
import rateLimit from '../../modules/rate-limit';


import moment from 'moment';

Meteor.methods({
  'discounts.insert': function discountsInsert(discount) {
    check(discount, {
      title: String,
      discountType: String,
      discountValue: Number,

      appliesToType: String,
      appliesToValue: String,
      appliesToRestrictionsAndExtras: Boolean,

      appliesToExistingDiscounts: Boolean,

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

    console.log(discount);

    const existsCategory = Discounts.findOne({ title: discount.title });

    if (existsCategory) {
      throw new Meteor.Error('500', `${discount.title} is already present`);
    }

    const insertedId = Random.id();

    const discountToInsert = {
      _id: insertedId,
      title: discount.title,
      discountType: discount.discountType,
      discountValue: discount.discountValue,

      appliesToType: discount.appliesToType,
      appliesToValue: discount.appliesToValue,
      appliesToRestrictionsAndExtras: discount.appliesToRestrictionsAndExtras,
      appliesToExistingDiscounts: discount.appliesToExistingDiscounts,

      usageLimitType: discount.usageLimitType,
      usageLimitValue: discount.usageLimitValue,

      minimumRequirementType: discount.minimumRequirementType,
      minimumRequirementValue: discount.minimumRequirementValue,

      customerEligibilityType: discount.customerEligibilityType,
      customerEligibilityValue: discount.customerEligibilityValue,

      status: discount.status,

      startDate: discount.startDate,
    };

    if (discount.endDate) {
      discountToInsert.endDate = discount.endDate;
    }

    try {
      const inserted = Discounts.insert({ ...discountToInsert });

      if (moment(discount.startDate).isAfter(moment(), 'day')) {
        const job = new Job(
          Jobs, 'enableDiscountJob', // type of job
          { _id: insertedId },
        );

        job.priority('normal').after(moment(discount.startDate).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).toDate()).save(); // Commit it to the server
      }


      if (discount.endDate && moment(discount.endDate).isSameOrAfter(moment(), 'day')) {
        const job = new Job(
          Jobs,
          'disableDiscountJob', // type of job
          {
            _id: insertedId,
          },
        );

        job.priority('normal').after(moment(discount.endDate).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).toDate()).save(); // Commit it to the server
      }


      return insertedId;
    } catch (exception) {
      console.log(exception);
      throw new Meteor.Error('500', exception);
    }
  },

  'discounts.update': function discountsUpdate(discount) {
    check(discount, {
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

    const existsDiscount = Discounts.findOne({ _id: discount._id });

    if (existsDiscount) {
      if (existsDiscount.title != discount.title && Discounts.findOne({ title: discount.title })) {
        throw new Meteor.Error('500', `${discount.title} is already present`);
      }
    }

    const keysToUnset = {};

    if (!discount.hasOwnProperty('usageLimitType')) {
      keysToUnset.usageLimitType = '';
      keysToUnset.usageLimitValue = '';
    }

    if (!discount.hasOwnProperty('endDate')) {
      keysToUnset.endDate = '';
    }

    if (discount.hasOwnProperty('appliesToExistingDiscounts')) {
      discount.appliesToExistingDiscounts = discount.appliesToExistingDiscounts;
    } else {
      discount.appliesToExistingDiscounts = false;
    }

    try {
      const discountId = discount._id;
      const updated = Discounts.update({ _id: discountId }, { $unset: keysToUnset, $set: discount });

      if (updated) {
        if (!discount.hasOwnProperty('endDate')) {
          Jobs.remove({ type: 'disableDiscountJob', 'data._id': discountId });
        } else if (!moment(discount.endDate).isSame(existsDiscount.endDate, 'day')) {
          Jobs.remove({ type: 'disableDiscountJob', 'data._id': discountId });

          const job = new Job(Jobs, 'disableDiscountJob', { _id: discountId });

          job.priority('normal').after(moment(discount.endDate).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).toDate()).save(); // Commit it to the server
        }

        if (!moment(discount.startDate).isSame(existsDiscount.startDate, 'day') && moment(discount.startDate).isAfter(moment(), 'day')) {
          Jobs.remove({ type: 'enableDiscountJob', 'data._id': discountId });

          const job = new Job(
            Jobs, 'enableDiscountJob', // type of job
            { _id: discountId },
          );

          job.priority('normal').after(moment(discount.startDate).set({ hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }).toDate()).save(); // Commit it to the server
        }
      }


      return discountId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      console.log(exception);
      throw new Meteor.Error('500', exception);
    }
  },
  'discounts.remove': function discountsRemove(discountId) {
    check(discountId, String);

    try {
      const removed = Discounts.remove(discountId);

      console.log(removed);

      const jobExists = Jobs.find({ 'data._id': discountId }).fetch();

      if (jobExists.length >= 1) {
        Jobs.remove({ _id: { $in: jobExists.map(e => e._id) } });
      }
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'discounts.batchRemove': function discountsBatchRemove(discountIds) {
    check(discountIds, Array);
    console.log('Server: discounts.batchRemove');

    try {
      const removed = Discounts.remove({ _id: { $in: discountIds } });

      const jobExists = Jobs.find({ 'data._id': { $in: discountIds } }).fetch();

      if (jobExists.length >= 1) {
        Jobs.remove({ _id: { $in: jobExists.map(e => e._id) } });
      }
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'discounts.enable': function discountsEnable(discountId) {
    check(discountId, String);

    const discount = Discounts.findOne({ _id: discountId });

    const updated = Discounts.update({ _id: discountId }, { $set: { status: 'active' }, $unset: { endDate: '' } });

    console.log(updated);

    return updated;
  },

  'discounts.disable': function discountsDisable(discountId) {
    check(discountId, String);

    const discount = Discounts.findOne({ _id: discountId });

    const updated = Discounts.update({ _id: discountId }, { $set: { status: 'expired' } });

    const jobExists = Jobs.find({ 'data._id': { $in: discountId } }).fetch();

    if (jobExists.length >= 1) {
      Jobs.remove({ _id: { $in: jobExists.map(e => e._id) } });
    }

    return updated;
  },

  'discounts.verify': function verifyDiscountCode(discountDetails) {
    check(discountDetails, {
      discountTitle: String,
      customerId: Match.Optional(String),
    });

    const discount = Discounts.findOne({ title: discountDetails.discountTitle });
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
    'discounts.insert',
    'discounts.update',
    'discounts.remove',
    'discounts.batchRemove',
    'discounts.verify',
  ],
  limit: 5,
  timeRange: 1000,
});
