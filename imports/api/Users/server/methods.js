import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { Random } from 'meteor/random';
import moment from 'moment';
import tz from 'moment-timezone';

import { Accounts } from 'meteor/accounts-base';
import editProfile from './edit-profile';
import rateLimit from '../../../modules/rate-limit';

import calculateSubscriptionCost from '../../../modules/server/billing/calculateSubscriptionCost';

import getCustomerPaymentProfile from '../../../modules/server/authorize/getCustomerPaymentProfile';
import createCustomerProfile from '../../../modules/server/authorize/createCustomerProfile';

import PostalCodes from '../../PostalCodes/PostalCodes';
import Subscriptions from '../../Subscriptions/Subscriptions';
import Discounts from '../../Discounts/Discounts';
import Lifestyles from '../../Lifestyles/Lifestyles';

import Jobs from '../../Jobs/Jobs';
import updateSubscription from '../../../modules/server/authorize/updateSubscription';

moment.tz.setDefault('America/Toronto');


Meteor.methods({
  'users.sendVerificationEmail': function usersSendVerificationEmail() {
    return Accounts.sendVerificationEmail(this.userId);
  },
  'users.sendEnrollmentEmail': function usersSendEnrollmentEmail(userId) {
    return Accounts.sendEnrollmentEmail(userId);
  },
  'users.editProfile': function usersEditProfile(profile) {
    check(profile, {
      emailAddress: String,
      profile: {
        name: {
          first: String,
          last: String,
        },
        phone: String,
      },
    });

    return editProfile({ userId: this.userId, profile })
      .then(response => response)
      .catch((exception) => {
        throw new Meteor.Error('500', exception);
      });
  },

  'users.addNewStaff': function addNewStaff(data) {
    const empId = Accounts.createUser({
      email: data.email,
      password: data.password,
    });

    Roles.addUsersToRoles(empId, [data.staffType]);

    return empId;
  },

  getCustomersTable(selector, options, skip, limit) {

    check(selector, Object);
    check(options, Object);
    check(limit, Number);
    check(skip, Number);

    const data = Meteor.users.aggregate([
      {
        $lookup: {
          from: 'Subscriptions',
          localField: 'subscriptionId',
          foreignField: '_id',
          as: 'joinedSubscription',
        },
      },
      {
        $lookup: {
          from: 'Lifestyles',
          localField: 'lifestyle',
          foreignField: '_id',
          as: 'joinedLifestyle',
        },
      },
      {
        $unwind: {
          path: '$joinedSubscription',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$joinedLifestyle',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          name: { $concat: ['$profile.name.first', ' ', '$profile.name.last'] },
        },
      },
      {
        $match: selector,
      },
      {
        $sort: options,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ], {
        collation: {
          locale: 'en_US',
          strength: 1,
        },
      });

    return data;
  },

  getCustomersCount(selector, sort) {

    check(selector, Object);
    check(sort, Object);

    // change this when you find a good solution to get the count
    // of the documents through a stage in the pipeline
    const query = Meteor.users.aggregate([
      {
        $lookup: {
          from: 'Subscriptions',
          localField: 'subscriptionId',
          foreignField: '_id',
          as: 'joinedSubscription',
        },
      },
      {
        $unwind: {
          path: '$joinedSubscription',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: selector,
      },
      {
        $sort: sort,
      },
      {
        $count: 'totalDocs',
      },
    ]);

    // console.log(query)

    let maxPages = 0;
    const LIMIT = 50;
    const totalDocs = query.length > 0 ? query[0].totalDocs : 0;

    if (totalDocs < LIMIT) {
      maxPages = 1;
    } else {
      maxPages = Math.ceil(totalDocs / LIMIT);
    }

    return {
      recordCount: totalDocs,
      maxPages,
    };
  },

  'customers.delete': function deleteCustomer(id) {

    check(id, String);


    try {
      const toDelete = Meteor.users.findOne({ _id: id });

      Subscriptions.remove({ customerId: id });

      if (toDelete.associatedProfiles > 0) {
        Meteor.users.remove({ _id: { $in: [id, ...toDelete.secondaryAccounts] } });
      } else {
        Meteor.users.remove({ _id: id });
      }

      return true;

    } catch (error) {
      console.log(error);
      throw new Meteor.Error('problem-deleteing-profile', 'There was a problem deleting the profile');
    }
  },

  'edit.customer.step1': function editStep1(data) {
    check(data, {
      id: String,
      firstName: String,
      lastName: String,
      postalCode: String,
      email: Match.Optional(String),
      secondary: Match.Optional(Boolean),
      phoneNumber: String,
      birthDay: Match.Optional(Match.OneOf(String, Number)),
      birthMonth: Match.Optional(Match.OneOf(String, Number)),
      username: Match.Optional(String),
    });

    const toUpdate = {
      'profile.name.first': data.firstName,
      'profile.name.last': data.lastName || '',
    };

    if (data.secondary) {

      toUpdate.username = data.username;

    } else {

      const postalCodeExists = PostalCodes.findOne({
        title: data.postalCode.substr(0, 3).toUpperCase(),
      });

      // console.log(postalCodeExists);

      if (!postalCodeExists) {
        // console.log(postalCodeExists);
        throw new Meteor.Error(400, 'Delivery not available in that area.');
      }

      toUpdate.postalCode = data.postalCode;
      toUpdate.postalCodeId = postalCodeExists._id;
      toUpdate['emails.0.address'] = data.email;
      toUpdate.phone = data.phoneNumber;
    }

    if (typeof data.birthDay === 'number' && typeof data.birthMonth === 'number') {
      toUpdate['profile.birthday.day'] = data.birthDay;
      toUpdate['profile.birthday.month'] = data.birthMonth;
    } else {
      toUpdate['profile.birthday.day'] = '';
      toUpdate['profile.birthday.month'] = '';
    }


    Meteor.users.update({
      _id: data.id,
    }, {
        $set: toUpdate,
      });

    // console.log(data);
  },

  'users.resetPassword': function handleResetPassword(id) {

    check(id, String);

    return Accounts.sendResetPasswordEmail(id);

  },

  'edit.customer.generateBillData': function editGenerateBillData(data) {

    check(data, {
      id: String,
      address: Object,
      lifestyle: String,
      discount: String,
      discountCode: Match.Optional(String),
      restrictions: Array,
      specificRestrictions: Array,
      subIngredients: Array,
      platingNotes: String,
      secondary: Match.Optional(Boolean),
      completeSchedule: Array,
      secondaryProfiles: Array,
      subscriptionId: String,
      delivery: Array,
      scheduleReal: Array,
      notifications: Object,
      coolerBag: Boolean,
      secondaryProfilesRemoved: Array,
    });

    const billing = calculateSubscriptionCost(data);

    return billing;

  },

  'customer.getBillingData': function (data) {
    check(data, {
      customerId: String,
      discountCode: Match.Optional(String),
      removeDiscount: Match.Optional(Boolean),
    });

    const primaryUser = Meteor.users.findOne({ _id: data.customerId });
    const sub = Subscriptions.findOne({ customerId: data.customerId });
    let discountCodeToSend = '';
    let discountCodeRemove = false;

    if (sub.hasOwnProperty('discountApplied')) {
      discountCodeToSend = sub.discountApplied;
    }

    if (data.hasOwnProperty('discountCode')) {
      discountCodeToSend = data.discountCode;
    }

    if (data.hasOwnProperty('removeDiscount')) {
      if (data.removeDiscount) {
        discountCodeRemove = true;
      }
    }

    const dataToSend = {
      id: primaryUser._id,
      address: primaryUser.address,
      lifestyle: primaryUser.lifestyle,
      discount: primaryUser.discount,
      discountCode: discountCodeToSend,
      discountCodeRemove: discountCodeRemove,
      restrictions: primaryUser.restrictions,
      specificRestrictions: primaryUser.specificRestrictions,
      subIngredients: primaryUser.preferences,
      platingNotes: primaryUser.platingNotes,
      secondary: false,
      completeSchedule: sub.completeSchedule,
      secondaryProfiles: [],
      subscriptionId: sub._id,
      delivery: sub.delivery,
      scheduleReal: primaryUser.schedule,
      notifications: primaryUser.notifications,
      coolerBag: primaryUser.coolerBag,
      secondaryProfilesRemoved: [],
    };

    if (primaryUser.associatedProfiles > 0) {
      dataToSend.secondary = true;
      const secondaries = Meteor.users.find({ primaryAccount: data.customerId }).fetch();

      secondaries.forEach((e, i) => {
        dataToSend.secondaryProfiles.push({
            first_name: e.profile.name.first || "",
            last_name: e.profile.name.last || "",
            lifestyle: e.lifestyle,
          scheduleReal: e.schedule,
          subIngredients: e.preferences,
          restrictions: e.restrictions,
          specificRestrictions: e.specificRestrictions,
          discount: e.discount,
        });
      });
    }

    // console.log(data);
    const billing = calculateSubscriptionCost(dataToSend);

    return billing;
  },

  'edit.customer.step2': function editStep2(data) {

    check(data, {
      id: String,
      updateWhen: String,
      address: Object,
      lifestyle: String,
      discount: String,
      discountCode: Match.Optional(String),
      restrictions: Array,
      specificRestrictions: Array,
      subIngredients: Array,
      platingNotes: String,
      secondary: Match.Optional(Boolean),
      completeSchedule: Array,
      secondaryProfiles: Array,
      subscriptionId: String,
      delivery: Array,
      scheduleReal: Array,
      notifications: Object,
      coolerBag: Boolean,
      secondaryProfilesRemoved: Array,
    });

    const sub = Subscriptions.findOne({ customerId: data.id });

    if (sub.hasOwnProperty('discountApplied')) {
      if (sub.discountApplied.length > 0) {
        data.discountCode = sub.discountApplied
      }
    }

    const billing = calculateSubscriptionCost(data);

    let friday = '';
    if (moment().isoWeekday() <= 5) {
      friday = moment().isoWeekday(5).hour(23).toDate();
    } else {
      friday = moment().add(1, 'weeks').isoWeekday(5).hour(23).toDate();
    }

    console.log("Edit customer Step 2 for ID: " + data.id);

    if (data.updateWhen === "friday") {

      const jobExists = Jobs.findOne({ type: 'editSubscriptionJob', 'data.id': data.id, status: 'waiting' });

      if (jobExists) {
        throw new Meteor.Error('cancel-job-already-present', `This subscription is already scheduled for update on ${moment(jobExists.after).format('YYYY-MM-DD')}`);
      }

      data.change = {
        lifestyle: [],
        restrictions: [],
        preferences: [],
        schedule: {},
      };

      const job = new Job(
        Jobs,
        'editSubscriptionJob', // type of job
        {
          ...data,
        },
      );

      job.priority('normal').after(friday).save(); // Commit it to the server

      return {
        subUpdateScheduled: true,
      };
    }

    if (data.secondaryProfiles && data.secondaryProfiles.length > 0) {

      data.secondaryProfiles.forEach((e) => {
        if (e._id) {
          Meteor.users.update({ _id: e._id }, {
            $set: {
              profile: {
                name: {
                  first: e.first_name,
                  last: e.last_name,
                },
              },

              secondary: true,
              primaryAccount: data.id,
              subscriptionId: data.subscriptionId,

              lifestyle: Lifestyles.findOne({ $or: [{ title: e.lifestyle }, { _id: e.lifestyle }] })._id,
              discount: e.discount,
              restrictions: e.restrictions,
              specificRestrictions: e.specificRestrictions,
              preferences: e.subIngredients,

              schedule: e.scheduleReal,

              platingNotes: e.platingNotes,
              adultOrChild: e.adultOrChild,
            },
          });
        } else {
          const randomId = Random.id();

          Meteor.users.insert({
            _id: randomId,
            profile: {
              name: {
                first: e.first_name,
                last: e.last_name,
              },
            },
            secondary: true,
            primaryAccount: data.id,
            subscriptionId: data.subscriptionId,
            username: Random.id(),
            lifestyle: Lifestyles.findOne({ $or: [{ title: e.lifestyle }, { _id: e.lifestyle }] })._id,
            discount: e.discount,
            restrictions: e.restrictions,
            specificRestrictions: e.specificRestrictions,
            preferences: e.subIngredients,
            platingNotes: e.platingNotes,
            roles: ['customer'],
            schedule: e.scheduleReal,
            adultOrChild: e.adultOrChild,
          });
        }
      });
    }

    if (data.secondaryProfilesRemoved.length > 0) {
      Meteor.users.remove({ _id: { $in: data.secondaryProfilesRemoved } });
    }

    const secondaryAccounts = Meteor.users.find({ primaryAccount: data.id }).fetch();
    const secondaryAccountIds = [];

    secondaryAccounts.forEach((e) => {
      secondaryAccountIds.push(e._id);
    });

    Meteor.users.update({ _id: data.id }, {
      $set: {
        lifestyle: data.lifestyle,
        discount: data.discount,

        schedule: data.scheduleReal,

        restrictions: data.restrictions,
        specificRestrictions: data.specificRestrictions,
        preferences: data.subIngredients,
        platingNotes: data.platingNotes,
        address: data.address,
        secondaryAccounts: secondaryAccountIds,
        associatedProfiles: secondaryAccountIds.length,
        coolerBag: data.coolerBag,
        notifications: data.notifications,
      },
    });

    const newDeliveryType = data.delivery.map((e, i) => {

      if (e == '') {
        return data.delivery[i] == null;
      }

      return e;
    });

    Subscriptions.update({
      _id: data.subscriptionId,
    }, {
        $set: {
          completeSchedule: data.completeSchedule,
          delivery: newDeliveryType,
          amount: billing.actualTotal,
          subscriptionItems: billing.lineItems,
        },
      });

  },

  'edit.customer.taxExempt': function editCustomerTaxExempt(data) {

      //Fix line items before doing receipts

      check(data, {
          subscriptionId: String,
          taxExempt: Boolean,
      });

      const sub = Subscriptions.findOne({ _id: data.subscriptionId });

      if(!sub) {
        throw new Meteor.Error('404', 'Subscription does not exist.');
      }

      const primaryUser = Meteor.users.findOne({ _id: sub.customerId });

      const billingData = {
          id: primaryUser._id,
          address: primaryUser.address,
          lifestyle: primaryUser.lifestyle,
          discount: primaryUser.discount,
          discountCode: sub.discountApplied || '',
          discountCodeRemove: false,
          restrictions: primaryUser.restrictions,
          specificRestrictions: primaryUser.specificRestrictions,
          subIngredients: primaryUser.preferences,
          platingNotes: primaryUser.platingNotes,
          secondary: false,
          completeSchedule: sub.completeSchedule,
          secondaryProfiles: [],
          subscriptionId: sub._id,
          delivery: sub.delivery,
          scheduleReal: primaryUser.schedule,
          notifications: primaryUser.notifications,
          coolerBag: primaryUser.coolerBag,
          secondaryProfilesRemoved: [],
      };

      if (primaryUser.associatedProfiles > 0) {
          billingData.secondary = true;
          const secondaries = Meteor.users.find({ primaryAccount: primaryUser._id }).fetch();

          secondaries.forEach((e, i) => {
              billingData.secondaryProfiles.push({
                  first_name: e.profile.name.first || "",
                  last_name: e.profile.name.last || "",
                  lifestyle: e.lifestyle,
                  scheduleReal: e.schedule,
                  subIngredients: e.preferences,
                  restrictions: e.restrictions,
                  specificRestrictions: e.specificRestrictions,
                  discount: e.discount,
              });
          });
      }

      const billing = calculateSubscriptionCost(billingData);

      console.log(billing);

      try {
          Subscriptions.update({
              _id: data.subscriptionId,
          }, {
              $set: {
                  taxExempt: data.taxExempt,
                  amount: data.taxExempt ? billing.primaryProfileBilling.groupTotal - billing.primaryProfileBilling.taxes : billing.primaryProfileBilling.groupTotal,
                  lineItems: billing.lineItems,
              },
          });
      } catch (exception) {
          throw new Meteor.Error('500', exception);
      }
  },

  'edit.customer.step4': function editStep4(data) {

    check(data, {
      id: String,
      updateWhen: String,
      discountCode: String,
      removeDiscount: Match.Optional(Boolean),
    });

    const primaryUser = Meteor.users.findOne({ _id: data.id });
    const sub = Subscriptions.findOne({ customerId: data.id });

    const discountCodeActual = Discounts.findOne({ title: data.discountCode });
    let discountCodeToSend = '';
    let discountCodeRemove = false;

    console.log("Begin Edit customer step 4 for customer ID "  + data.id);

    if (sub.hasOwnProperty('discountApplied')) {
      discountCodeToSend = sub.discountApplied;
    }

    if (data.discountCode) {
      discountCodeToSend = data.discountCode;
    }

    if (data.hasOwnProperty('removeDiscount')) {
      if (data.removeDiscount) {
        discountCodeRemove = true;
      }
    }

    const billingData = {
      id: primaryUser._id,
      address: primaryUser.address,
      lifestyle: primaryUser.lifestyle,
      discount: primaryUser.discount,
      discountCode: discountCodeToSend,
      discountCodeRemove,
      restrictions: primaryUser.restrictions,
      specificRestrictions: primaryUser.specificRestrictions,
      subIngredients: primaryUser.preferences,
      platingNotes: primaryUser.platingNotes,
      secondary: false,
      completeSchedule: sub.completeSchedule,
      secondaryProfiles: [],
      subscriptionId: sub._id,
      delivery: sub.delivery,
      scheduleReal: primaryUser.schedule,
      notifications: primaryUser.notifications,
      coolerBag: primaryUser.coolerBag,
      secondaryProfilesRemoved: [],
    };

    if (primaryUser.associatedProfiles > 0) {
      billingData.secondary = true;
      const secondaries = Meteor.users.find({ primaryAccount: data.id }).fetch();

      secondaries.forEach((e, i) => {
        billingData.secondaryProfiles.push({
            first_name: e.profile.name.first || "",
            last_name: e.profile.name.last || "",
            lifestyle: e.lifestyle,
          scheduleReal: e.schedule,
          subIngredients: e.preferences,
          restrictions: e.restrictions,
          specificRestrictions: e.specificRestrictions,
          discount: e.discount,
        });
      });
    }

    const billing = calculateSubscriptionCost(billingData);

    // console.log(data);
    // console.log(billing);

    let friday = '';

    // if we haven't yet passed the day of the week that I need:
    if (moment().isoWeekday() <= 5) {
      // then just give me this week's instance of that day
      friday = moment().isoWeekday(5).hour(23).minute(30).toDate();
    } else {
      // otherwise, give me next week's instance of that day
      friday = moment().add(1, 'weeks').isoWeekday(5).hour(23).minute(30).toDate();
    }

    if (data.updateWhen === "friday") {

      console.log('Edit customer step 4 scheduled on friday for customer ID ' + data.id);

      const jobExists = Jobs.findOne({ type: 'editSubscriptionJob', 'data.id': data.id, status: 'waiting' });

      if (jobExists) {
        Jobs.update({ _id: jobExists._id }, { $set: { 'data.discountCodeRemove': discountCodeRemove, 'data.discountCode': discountCodeToSend } })

        return {
          subUpdateScheduled: true,
        };
      }

      const job = new Job(Jobs, 'editSubscriptionJob', billingData);
      job.priority('normal').after(friday).save(); // Commit it to the server

      return {
        subUpdateScheduled: true,
      };
    }

    const keysToUnset = {};
    const keysToSet = {
      amount: billing.actualTotal,
      subscriptionItems: billing.lineItems,
    };

    if (data.hasOwnProperty('removeDiscount')) {
      keysToUnset.discountApplied = 1;
    } else {
      keysToSet.discountApplied = discountCodeActual._id;
    }

    Subscriptions.update({
      customerId: data.id,
    }, {
      $set: keysToSet,
      $unset: keysToUnset,
    });

  },

  'customers.step1': function customerStep1(data) {
    check(data, {
      email: String,
      postalCode: String,
      firstName: String,
      lastName: String,
      phoneNumber: String,
      birthDay: Match.Optional(Match.OneOf(String, Number)),
      birthMonth: Match.Optional(Match.OneOf(String, Number)),
    });

    const postalCodeExists = PostalCodes.findOne({ title: data.postalCode.substr(0, 3).toUpperCase() });

    if (!postalCodeExists) {
      throw new Meteor.Error('postal-code-not-found', 'Postal code does not exist.');
    }

    let userId;
    const profile = {
      name: {
        first: data.firstName,
        last: data.lastName,
      },
    };

    if ('birthDay' in data && 'birthMonth' in data) {
      profile.birthday = {
        day: data.birthDay,
        month: data.birthMonth,
      };
    }

    try {
      userId = Accounts.createUser({
        email: data.email,
        profile,
      });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }

    Roles.addUsersToRoles(userId, ['customer']);

    Meteor.users.update(
      { _id: userId },
      {
        $set: {
          postalCode: data.postalCode.toUpperCase(),
          postalCodeId: postalCodeExists._id,
          status: 'abandoned',
          phone: data.phoneNumber,
          adultOrChild: 'adult',
        },
      },
    );

    return userId;
  },

  'customers.step2': function customerStep2(data) {
    check(data, {
      id: String,
      email: String,
      firstName: String,
      lastName: String,
      phoneNumber: String,
      adultOrChild: String,
    });

    try {
      Meteor.users.update(
        { _id: data.id },
        {
          $set: {
            'profile.name.first': data.firstName,
            'profile.name.last': data.lastName,
            phone: data.phoneNumber,
            adultOrChild: 'adult',
          },
        },
      );
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'customer.step5.noCreditCard': function noCreditCard(customerInfo) {
    check(customerInfo, Object);

    // console.log(customerInfo);

    const subscriptionIdToSave = Random.id();

    Meteor.users.update(
      { _id: customerInfo.id },
      {
        $set: {
          address: customerInfo.address,
          subscriptionId: subscriptionIdToSave,
          lifestyle: customerInfo.primaryProfileBilling.lifestyle._id,
          discount: customerInfo.primaryProfileBilling.discount,
          restrictions: customerInfo.primaryProfileBilling.restrictions,
          specificRestrictions:
            customerInfo.primaryProfileBilling.specificRestrictions,
          preferences: customerInfo.primaryProfileBilling.preferences,
          schedule: customerInfo.scheduleReal,
          platingNotes: customerInfo.platingNotes,
          subscriptionStartDate: customerInfo.activeImmediate ? new Date() : customerInfo.subscriptionStartDate,
          subscriptionStartDateRaw: customerInfo.activeImmediate ? new Date() : customerInfo.subscriptionStartDateRaw,
          associatedProfiles: customerInfo.secondaryProfileCount,
          coolerBag: customerInfo.coolerBag,
          notifications: customerInfo.notifications,
        },
      },
    );

    const secondaryAccountIds = [];

    if (customerInfo.secondaryProfileCount > 0) {
      customerInfo.secondaryProfiles.forEach((element, index) => {
        let userId;

        try {
          userId = Accounts.createUser({
            username: Random.id(),
            profile: {
              name: {
                first: element.first_name,
                last: element.last_name,
              },
            },
          });
        } catch (exception) {
          throw new Meteor.Error('500', exception);
        }

        Roles.addUsersToRoles(userId, ['customer']);

        secondaryAccountIds.push(userId);

        Meteor.users.update(
          { _id: userId },
          {
            $set: {
              secondary: true,
              primaryAccount: customerInfo.id,
              subscriptionId: subscriptionIdToSave,
              lifestyle:
                customerInfo.secondaryProfilesBilling[index].lifestyle._id,
              discount: customerInfo.secondaryProfilesBilling[index].discount,
              restrictions:
                customerInfo.secondaryProfilesBilling[index].restrictions,
              specificRestrictions:
                customerInfo.secondaryProfilesBilling[index]
                  .specificRestrictions,
              preferences:
                customerInfo.secondaryProfilesBilling[index].preferences,
              schedule: element.scheduleReal,
              platingNotes: element.platingNotes,
              adultOrChild: element.adultOrChild,
            },
          },
        );
      });

      Meteor.users.update(
        { _id: customerInfo.id },
        {
          $set: {
            secondaryAccounts: secondaryAccountIds,
          },
        },
      );
    }

    let actualTotal = customerInfo.primaryProfileBilling.groupTotal;

    if (customerInfo.taxExempt) {
      actualTotal =
        customerInfo.primaryProfileBilling.groupTotal -
        customerInfo.primaryProfileBilling.taxes;
    }

    const subscriptionItemsReal = [];

    const primaryProfileLineItems = {
      lifestyle: {
        title: customerInfo.primaryProfileBilling.lifestyle.title,
        meals:
          customerInfo.primaryProfileBilling.breakfast.totalQty +
          customerInfo.primaryProfileBilling.lunch.totalQty +
          customerInfo.primaryProfileBilling.dinner.totalQty +
          customerInfo.primaryProfileBilling.chefsChoiceBreakfast.totalQty +
          customerInfo.primaryProfileBilling.chefsChoiceLunch.totalQty +
          customerInfo.primaryProfileBilling.chefsChoiceDinner.totalQty,

        price:
          customerInfo.primaryProfileBilling.breakfast.totalQty *
          customerInfo.primaryProfileBilling.breakfastPrice +
          customerInfo.primaryProfileBilling.lunch.totalQty *
          customerInfo.primaryProfileBilling.lunchPrice +
          customerInfo.primaryProfileBilling.dinner.totalQty *
          customerInfo.primaryProfileBilling.dinnerPrice +
          customerInfo.primaryProfileBilling.chefsChoiceBreakfast.totalQty *
          customerInfo.primaryProfileBilling.chefsChoiceBreakfastPrice +
          customerInfo.primaryProfileBilling.chefsChoiceLunch.totalQty *
          customerInfo.primaryProfileBilling.chefsChoiceLunchPrice +
          customerInfo.primaryProfileBilling.chefsChoiceDinner.totalQty *
          customerInfo.primaryProfileBilling.chefsChoiceDinnerPrice,
      },
      restrictions: [],
    };

    if (customerInfo.primaryProfileBilling.discountActual > 0) {
      primaryProfileLineItems.discount = {
        title:
          customerInfo.primaryProfileBilling.discount.charAt(0).toUpperCase() +
          customerInfo.primaryProfileBilling.discount.substr(
            1,
            customerInfo.primaryProfileBilling.discount.length,
          ),
        amount: customerInfo.primaryProfileBilling.discountActual,
      };
    }

    if (customerInfo.primaryProfileBilling.totalAthleticSurcharge > 0) {
      primaryProfileLineItems.extraAthletic = {
        title: 'Athletic',
        amount: customerInfo.primaryProfileBilling.totalAthleticSurcharge,
        actual: customerInfo.primaryProfileBilling.lifestyle.extraAthletic,
        type:
          customerInfo.primaryProfileBilling.lifestyle
            .discountOrExtraTypeAthletic,
      };
    }

    if (customerInfo.primaryProfileBilling.totalBodybuilderSurcharge > 0) {
      primaryProfileLineItems.extraBodybuilder = {
        title: 'Bodybuilder',
        amount: customerInfo.primaryProfileBilling.totalBodybuilderSurcharge,
        actual: customerInfo.primaryProfileBilling.lifestyle.extraBodybuilder,
        type:
          customerInfo.primaryProfileBilling.lifestyle
            .discountOrExtraTypeBodybuilder,
      };
    }

    if (customerInfo.primaryProfileBilling.restrictionsActual.length > 0) {
      customerInfo.primaryProfileBilling.restrictionsActual.forEach((e, i) => {
        primaryProfileLineItems.restrictions.push({
          title: e.title,
          extra: e.extra,
          type: e.discountOrExtraType,
          surcharge:
            customerInfo.primaryProfileBilling.restrictionsSurcharges[i],
        });
      });
    }

    if (customerInfo.primaryProfileBilling.deliveryCost > 0) {
      primaryProfileLineItems.deliveryCost =
        customerInfo.primaryProfileBilling.deliveryCost;
    }

    if (customerInfo.primaryProfileBilling.deliverySurcharges > 0) {
      primaryProfileLineItems.deliverySurcharges =
        customerInfo.primaryProfileBilling.deliverySurcharges;
    }

    primaryProfileLineItems.taxes = customerInfo.primaryProfileBilling.taxes;

    if (customerInfo.taxExempt) {
      primaryProfileLineItems.taxes =
        customerInfo.primaryProfileBilling.groupTotal -
        customerInfo.primaryProfileBilling.taxes;
    } else {
      primaryProfileLineItems.taxExempt = true;
      primaryProfileLineItems.total =
        customerInfo.primaryProfileBilling.groupTotal;
    }

    subscriptionItemsReal.push(primaryProfileLineItems);

    if (customerInfo.secondaryProfileCount > 0) {
      customerInfo.secondaryProfilesBilling.forEach((e, i) => {
        const currentProfileLineItems = {
          lifestyle: {
            title: customerInfo.secondaryProfilesBilling[i].lifestyle.title,
            meals:
              customerInfo.secondaryProfilesBilling[i].breakfast.totalQty +
              customerInfo.secondaryProfilesBilling[i].lunch.totalQty +
              customerInfo.secondaryProfilesBilling[i].dinner.totalQty +
              customerInfo.secondaryProfilesBilling[i].chefsChoiceBreakfast.totalQty +
              customerInfo.secondaryProfilesBilling[i].chefsChoiceLunch.totalQty +
              customerInfo.secondaryProfilesBilling[i].chefsChoiceDinner.totalQty,

            price:
              customerInfo.secondaryProfilesBilling[i].breakfast.totalQty *
              customerInfo.secondaryProfilesBilling[i].breakfastPrice +
              customerInfo.secondaryProfilesBilling[i].lunch.totalQty *
              customerInfo.secondaryProfilesBilling[i].lunchPrice +
              customerInfo.secondaryProfilesBilling[i].dinner.totalQty *
              customerInfo.secondaryProfilesBilling[i].dinnerPrice +
              customerInfo.secondaryProfilesBilling[i].chefsChoiceBreakfast.totalQty *
              customerInfo.secondaryProfilesBilling[i].chefsChoiceBreakfastPrice +
              customerInfo.secondaryProfilesBilling[i].chefsChoiceLunch.totalQty *
              customerInfo.secondaryProfilesBilling[i].chefsChoiceLunchPrice +
              customerInfo.secondaryProfilesBilling[i].chefsChoiceDinner.totalQty *
              customerInfo.secondaryProfilesBilling[i].chefsChoiceDinnerPrice,
          },
          restrictions: [],
        };

        if (customerInfo.secondaryProfilesBilling[i].discountActual > 0) {
          primaryProfileLineItems.discount = {
            title:
              customerInfo.secondaryProfilesBilling[i].discount
                .charAt(0)
                .toUpperCase() +
              customerInfo.secondaryProfilesBilling[i].discount.substr(
                1,
                customerInfo.secondaryProfilesBilling[i].discount.length,
              ),
            amount: customerInfo.secondaryProfilesBilling[i].discountActual,
          };
        }

        if (
          customerInfo.secondaryProfilesBilling[i].totalAthleticSurcharge > 0
        ) {
          primaryProfileLineItems.extraAthletic = {
            title: 'Athletic',
            amount:
              customerInfo.secondaryProfilesBilling[i].totalAthleticSurcharge,
            actual:
              customerInfo.secondaryProfilesBilling[i].lifestyle.extraAthletic,
            type:
              customerInfo.secondaryProfilesBilling[i].lifestyle
                .discountOrExtraTypeAthletic,
          };
        }

        if (
          customerInfo.secondaryProfilesBilling[i].totalBodybuilderSurcharge > 0
        ) {
          primaryProfileLineItems.extraBodybuilder = {
            title: 'Bodybuilder',
            amount:
              customerInfo.secondaryProfilesBilling[i]
                .totalBodybuilderSurcharge,
            actual:
              customerInfo.secondaryProfilesBilling[i].lifestyle
                .extraBodybuilder,
            type:
              customerInfo.secondaryProfilesBilling[i].lifestyle
                .discountOrExtraTypeBodybuilder,
          };
        }

        if (
          customerInfo.secondaryProfilesBilling[i].restrictionsActual.length > 0
        ) {
          customerInfo.secondaryProfilesBilling[i].restrictionsActual.forEach(
            (restriction, restrictionIndex) => {
              primaryProfileLineItems.restrictions.push({
                title: restriction.title,
                extra: restriction.extra,
                type: restriction.discountOrExtraType,
                surcharge: customerInfo.secondaryProfilesBilling[i].restrictionsSurcharges[restrictionIndex],
              });
            },
          );
        }

        subscriptionItemsReal.push(currentProfileLineItems);
      });
    }
    // console.log(subscriptionItemsReal);

    const newDeliveryType = customerInfo.deliveryType.map((e, i) => {

      if (e == '') {
        return customerInfo.deliveryType[i] == null;
      }

      return e;

    });

    const subscriptionId = Subscriptions.insert({
      _id: subscriptionIdToSave,
      customerId: customerInfo.id,
      status: customerInfo.activeImmediate ? 'active' : 'paused',
      paymentMethod: customerInfo.paymentMethod,
      amount: actualTotal,
      taxExempt: customerInfo.taxExempt,
      completeSchedule: customerInfo.completeSchedule,
      delivery: newDeliveryType,
      subscriptionItems: subscriptionItemsReal,
    });

    console.log(subscriptionId);

    if (customerInfo.activeImmediate == false) {

      const lastWeeksFriday = moment(customerInfo.subscriptionStartDateRaw).subtract(1, 'w').isoWeekday(5).hour(23).minute(0).toDate();

      const job = new Job(
        Jobs,
        'setSubscriptionActive', // type of job
        {
          subscriptionId,
          customerId: customerInfo.id,
        },
      );

      job.priority('normal').after(lastWeeksFriday).save()
    }
  },

  'customers.step5': function customerStep5(opaqueData, customerInfo) {
    check(opaqueData, {
      dataDescriptor: String,
      dataValue: String,
    });

    check(customerInfo, Object);

    const subscriptionIdToSave = Random.id();


    // console.log(customerInfo);


    const syncCreateCustomerProfile = Meteor.wrapAsync(createCustomerProfile);

    // create primary profile over on Authorize
    const createCustomerProfileRes = syncCreateCustomerProfile(
      opaqueData.dataDescriptor,
      opaqueData.dataValue,
      {
        email: customerInfo.email,
        id: customerInfo.id,
        postalCode: customerInfo.billingPostalCode,
        nameOnCard: customerInfo.nameOnCard,
        streetAddress: customerInfo.billingStreetAddress,
      },
    );

    if (
      createCustomerProfileRes.messages.resultCode &&
      createCustomerProfileRes.messages.resultCode != 'Ok'
    ) {
      throw new Meteor.Error(500, 'There was a problem creating user profile.');
    }

    // primary profile created successfully on authorize

    const paymentProfileIdObject = createCustomerProfileRes.customerPaymentProfileIdList.numericString[0];
    let paymentProfileIdString = "";
    Object.keys(paymentProfileIdObject).map(e => { paymentProfileIdString += `${paymentProfileIdObject[e]}` })


    // start adding plan data to primary profile and each of the secondary profile(s)
    Meteor.users.update(
      { _id: customerInfo.id },
      {
        $set: {
          subscriptionId: subscriptionIdToSave,
          address: customerInfo.address,
          lifestyle: customerInfo.primaryProfileBilling.lifestyle._id,
          discount: customerInfo.primaryProfileBilling.discount,
          restrictions: customerInfo.primaryProfileBilling.restrictions,
          specificRestrictions:
            customerInfo.primaryProfileBilling.specificRestrictions,
          preferences: customerInfo.primaryProfileBilling.preferences,
          schedule: customerInfo.scheduleReal,
          platingNotes: customerInfo.platingNotes,

          subscriptionStartDate: customerInfo.subscriptionStartDate,
          subscriptionStartDateRaw: customerInfo.subscriptionStartDateRaw,
          associatedProfiles: customerInfo.secondaryProfileCount,
          coolerBag: customerInfo.coolerBag,
          notifications: customerInfo.notifications,
        },
      },
    );

    const secondaryAccountIds = [];

    if (customerInfo.secondaryProfileCount > 0) {
      customerInfo.secondaryProfiles.forEach((element, index) => {
        let userId;

        try {
          userId = Accounts.createUser({
            username: Random.id(),
            profile: {
              name: {
                first: element.first_name,
                last: element.last_name,
              },
            },
          });
        } catch (exception) {
          throw new Meteor.Error('500', exception);
        }

        Roles.addUsersToRoles(userId, ['customer']);

        secondaryAccountIds.push(userId);

        Meteor.users.update(
          { _id: userId },
          {
            $set: {
              secondary: true,
              primaryAccount: customerInfo.id,
              subscriptionId: subscriptionIdToSave,
              lifestyle:
                customerInfo.secondaryProfilesBilling[index].lifestyle._id,
              restrictions:
                customerInfo.secondaryProfilesBilling[index].restrictions,
              specificRestrictions:
                customerInfo.secondaryProfilesBilling[index]
                  .specificRestrictions,
              preferences:
                customerInfo.secondaryProfilesBilling[index].preferences,
              schedule: element.scheduleReal,
              platingNotes: element.platingNotes,
              adultOrChild: element.adultOrChild,
            },
          },
        );
      });

      Meteor.users.update(
        { _id: customerInfo.id },
        {
          $set: {
            secondaryAccounts: secondaryAccountIds,
          },
        },
      );
    }

    // Meteor._sleepForMs(10000);

    // totaling
    let actualTotal = customerInfo.primaryProfileBilling.groupTotal;

    if (customerInfo.taxExempt) {
      actualTotal =
        customerInfo.primaryProfileBilling.groupTotal -
        customerInfo.primaryProfileBilling.taxes;
    }

    actualTotal = parseFloat(actualTotal.toFixed(2));

    const previousWeeksFriday = moment(customerInfo.subscriptionStartDateRaw).subtract(1, 'w').isoWeekday(5).hour(23).minute(30).toDate();

    const subscriptionItemsReal = [];

    const primaryProfileLineItems = {
      lifestyle: {
        title: customerInfo.primaryProfileBilling.lifestyle.title,
        meals:
          customerInfo.primaryProfileBilling.breakfast.totalQty +
          customerInfo.primaryProfileBilling.lunch.totalQty +
          customerInfo.primaryProfileBilling.dinner.totalQty +
          customerInfo.primaryProfileBilling.chefsChoiceBreakfast.totalQty +
          customerInfo.primaryProfileBilling.chefsChoiceLunch.totalQty +
          customerInfo.primaryProfileBilling.chefsChoiceDinner.totalQty,

        price:
          customerInfo.primaryProfileBilling.breakfast.totalQty *
          customerInfo.primaryProfileBilling.breakfastPrice +
          customerInfo.primaryProfileBilling.lunch.totalQty *
          customerInfo.primaryProfileBilling.lunchPrice +
          customerInfo.primaryProfileBilling.dinner.totalQty *
          customerInfo.primaryProfileBilling.dinnerPrice +
          customerInfo.primaryProfileBilling.chefsChoiceBreakfast.totalQty *
          customerInfo.primaryProfileBilling.chefsChoiceBreakfastPrice +
          customerInfo.primaryProfileBilling.chefsChoiceLunch.totalQty *
          customerInfo.primaryProfileBilling.chefsChoiceLunchPrice +
          customerInfo.primaryProfileBilling.chefsChoiceDinner.totalQty *
          customerInfo.primaryProfileBilling.chefsChoiceDinnerPrice,
      },
      restrictions: [],
    };

    if (customerInfo.primaryProfileBilling.discountActual > 0) {
      primaryProfileLineItems.discount = {
        title:
          customerInfo.primaryProfileBilling.discount.charAt(0).toUpperCase() +
          customerInfo.primaryProfileBilling.discount.substr(
            1,
            customerInfo.primaryProfileBilling.discount.length,
          ),
        amount: customerInfo.primaryProfileBilling.discountActual,
      };
    }

    if (customerInfo.primaryProfileBilling.totalAthleticSurcharge > 0) {
      primaryProfileLineItems.extraAthletic = {
        title: 'Athletic',
        amount: customerInfo.primaryProfileBilling.totalAthleticSurcharge,
        actual: customerInfo.primaryProfileBilling.lifestyle.extraAthletic,
        type:
          customerInfo.primaryProfileBilling.lifestyle
            .discountOrExtraTypeAthletic,
      };
    }

    if (customerInfo.primaryProfileBilling.totalBodybuilderSurcharge > 0) {
      primaryProfileLineItems.extraBodybuilder = {
        title: 'Bodybuilder',
        amount: customerInfo.primaryProfileBilling.totalBodybuilderSurcharge,
        actual: customerInfo.primaryProfileBilling.lifestyle.extraBodybuilder,
        type:
          customerInfo.primaryProfileBilling.lifestyle
            .discountOrExtraTypeBodybuilder,
      };
    }

    if (customerInfo.primaryProfileBilling.restrictionsActual.length > 0) {
      customerInfo.primaryProfileBilling.restrictionsActual.forEach((e, i) => {
        primaryProfileLineItems.restrictions.push({
          title: e.title,
          extra: e.extra,
          type: e.discountOrExtraType,
          surcharge:
            customerInfo.primaryProfileBilling.restrictionsSurcharges[i],
        });
      });
    }

    if (customerInfo.primaryProfileBilling.deliveryCost > 0) {
      primaryProfileLineItems.deliveryCost =
        customerInfo.primaryProfileBilling.deliveryCost;
    }

    if (customerInfo.primaryProfileBilling.deliverySurcharges > 0) {
      primaryProfileLineItems.deliverySurcharges =
        customerInfo.primaryProfileBilling.deliverySurcharges;
    }

    primaryProfileLineItems.taxes = customerInfo.primaryProfileBilling.taxes;

    if (customerInfo.taxExempt) {
      primaryProfileLineItems.taxes =
        customerInfo.primaryProfileBilling.groupTotal -
        customerInfo.primaryProfileBilling.taxes;
    } else {
      primaryProfileLineItems.taxExempt = true;
      primaryProfileLineItems.total =
        customerInfo.primaryProfileBilling.groupTotal;
    }

    subscriptionItemsReal.push(primaryProfileLineItems);

    if (customerInfo.secondaryProfileCount > 0) {
      customerInfo.secondaryProfilesBilling.forEach((e, i) => {
        const currentProfileLineItems = {
          lifestyle: {
            title: customerInfo.secondaryProfilesBilling[i].lifestyle.title,
            meals:
              customerInfo.secondaryProfilesBilling[i].breakfast.totalQty +
              customerInfo.secondaryProfilesBilling[i].lunch.totalQty +
              customerInfo.secondaryProfilesBilling[i].dinner.totalQty +
              customerInfo.secondaryProfilesBilling[i].chefsChoiceBreakfast.totalQty +
              customerInfo.secondaryProfilesBilling[i].chefsChoiceLunch.totalQty +
              customerInfo.secondaryProfilesBilling[i].chefsChoiceDinner.totalQty,

            price:
              customerInfo.secondaryProfilesBilling[i].breakfast.totalQty *
              customerInfo.secondaryProfilesBilling[i].breakfastPrice +
              customerInfo.secondaryProfilesBilling[i].lunch.totalQty *
              customerInfo.secondaryProfilesBilling[i].lunchPrice +
              customerInfo.secondaryProfilesBilling[i].dinner.totalQty *
              customerInfo.secondaryProfilesBilling[i].dinnerPrice +
              customerInfo.secondaryProfilesBilling[i].chefsChoiceBreakfast.totalQty *
              customerInfo.secondaryProfilesBilling[i].chefsChoiceBreakfastPrice +
              customerInfo.secondaryProfilesBilling[i].chefsChoiceLunch.totalQty *
              customerInfo.secondaryProfilesBilling[i].chefsChoiceLunchPrice +
              customerInfo.secondaryProfilesBilling[i].chefsChoiceDinner.totalQty *
              customerInfo.secondaryProfilesBilling[i].chefsChoiceDinnerPrice,
          },
          restrictions: [],
        };

        if (customerInfo.secondaryProfilesBilling[i].discountActual > 0) {
          primaryProfileLineItems.discount = {
            title:
              customerInfo.secondaryProfilesBilling[i].discount
                .charAt(0)
                .toUpperCase() +
              customerInfo.secondaryProfilesBilling[i].discount.substr(
                1,
                customerInfo.secondaryProfilesBilling[i].discount.length,
              ),
            amount: customerInfo.secondaryProfilesBilling[i].discountActual,
          };
        }

        if (
          customerInfo.secondaryProfilesBilling[i].totalAthleticSurcharge > 0
        ) {
          primaryProfileLineItems.extraAthletic = {
            title: 'Athletic',
            amount:
              customerInfo.secondaryProfilesBilling[i].totalAthleticSurcharge,
            actual:
              customerInfo.secondaryProfilesBilling[i].lifestyle.extraAthletic,
            type:
              customerInfo.secondaryProfilesBilling[i].lifestyle
                .discountOrExtraTypeAthletic,
          };
        }

        if (
          customerInfo.secondaryProfilesBilling[i].totalBodybuilderSurcharge > 0
        ) {
          primaryProfileLineItems.extraBodybuilder = {
            title: 'Bodybuilder',
            amount:
              customerInfo.secondaryProfilesBilling[i]
                .totalBodybuilderSurcharge,
            actual:
              customerInfo.secondaryProfilesBilling[i].lifestyle
                .extraBodybuilder,
            type:
              customerInfo.secondaryProfilesBilling[i].lifestyle
                .discountOrExtraTypeBodybuilder,
          };
        }

        if (
          customerInfo.secondaryProfilesBilling[i].restrictionsActual.length > 0
        ) {
          customerInfo.secondaryProfilesBilling[i].restrictionsActual.forEach(
            (restriction, restrictionIndex) => {
              primaryProfileLineItems.restrictions.push({
                title: restriction.title,
                extra: restriction.extra,
                type: restriction.discountOrExtraType,
                surcharge:
                  customerInfo.secondaryProfilesBilling[i]
                    .restrictionsSurcharges[restrictionIndex],
              });
            },
          );
        }

        subscriptionItemsReal.push(currentProfileLineItems);
      });
    }

    const newDeliveryType = customerInfo.deliveryType.map((e, i) => {

      if (e == '') {
        return customerInfo.deliveryType[i] == null;
      }

      return e;


    });

    Subscriptions.insert({
      _id: subscriptionIdToSave,
      customerId: customerInfo.id,
      authorizeCustomerProfileId:
        createCustomerProfileRes.customerProfileId,
      authorizePaymentProfileId: paymentProfileIdString,
      status: 'paused',
      paymentMethod: customerInfo.paymentMethod,
      amount: actualTotal,
      taxExempt: customerInfo.taxExempt,
      completeSchedule: customerInfo.completeSchedule,
      delivery: newDeliveryType,
      subscriptionItems: subscriptionItemsReal,
    });

    const job = new Job(Jobs, 'setSubscriptionActiveJob', { subscriptionId: subscriptionIdToSave });
    job.priority('normal').after(previousWeeksFriday).save();

    return createCustomerProfileRes;
  },


  getSubscriptionDetails(subscriptionId) {

    check(subscriptionId, String);

    const syncGetSubscription = Meteor.wrapAsync(getSubscription);
    const getSubscriptionRes = syncGetSubscription(subscriptionId);

    return getSubscriptionRes;

  },

  getCustomerPaymentProfile(customerProfileId, paymentProfileId) {

    check(paymentProfileId, String);
    check(customerProfileId, String);

    console.log("YES")

    const syncGetCustomerPaymentProfile = Meteor.wrapAsync(getCustomerPaymentProfile);
    const getCustomerPaymentProfileRes = syncGetCustomerPaymentProfile(customerProfileId, paymentProfileId);

    return getCustomerPaymentProfileRes;

  },

  cancelSubscription(when, customerId) {

    check(when, String);
    check(customerId, String);

    let saturday = '';

    // if we haven't yet passed the day of the week that I need:
    if (moment().isoWeekday() <= 5) {
      // then just give me this week's instance of that day
      saturday = moment().isoWeekday(5).hour(23).toDate();
    } else {
      // otherwise, give me next week's instance of that day
      saturday = moment().add(1, 'weeks').isoWeekday(5).hour(23).toDate();
    }

    const subscription = Subscriptions.findOne({ customerId });

    if (!subscription) {
      throw new Meteor.Error('500', 'No subscription found to cancel.');
    }

    if (subscription && subscription.status === 'cancelled') {
      throw new Meteor.Error('500', 'Subscription is already in the cancelled state.');
    }

    // if (subscription.paymentMethod == 'card') {
    //   if (when == 'immediate') {
    //     const syncCancelSubscription = Meteor.wrapAsync(cancelSubscription);

    //     const syncCancelSubscriptionRes = syncCancelSubscription(subscription.authorizeSubscriptionId);

    //     if (syncCancelSubscriptionRes.messages.resultCode == 'Ok') {

    //       const statusUpdate = Subscriptions.update({ customerId }, { $set: { status: 'cancelled' } });

    //       const jobExists = Jobs.findOne({ type: 'setSubscriptionCancelledCardJob', 'data.subscriptionId': subscription._id, status: 'waiting' });

    //       if (jobExists) {
    //         Jobs.remove({ _id: jobExists._id });
    //       }

    //       return true;

    //     }

    //     throw new Meteor.Error('500', syncCancelSubscriptionRes.messages.message[0].text);


    //   } else if (when == 'saturday') {

    //     const jobExists = Jobs.findOne({ type: 'setSubscriptionCancelledCardJob', 'data.subscriptionId': subscription._id, status: 'waiting' });

    //     if (jobExists) {
    //       throw new Meteor.Error('cancel-job-already-present', `This subscription is already scheduled for cancellation on ${moment(jobExists.after).format('YYYY-MM-DD')}`);
    //     }

    //     const job = new Job(
    //       Jobs,
    //       'setSubscriptionCancelledCardJob', // type of job
    //       {
    //         subscriptionId: subscription._id,
    //         customerId,
    //       },
    //     );

    //     // job.priority('normal').delay(60 * 500).save(); // Commit it to the server
    //     job.priority('normal').after(saturday).save(); // Commit it to the server

    //   }

    // } 
    // else if (subscription.paymentMethod == 'cash' || subscription.paymentMethod == 'interac') {
    if (subscription.paymentMethod == 'cash' || subscription.paymentMethod == 'interac' || subscription.paymentMethod == "card") {
      if (when == 'immediate') {

        const statusUpdate = Subscriptions.update({ customerId }, { $set: { status: 'cancelled' } });

        if (statusUpdate) {

          const jobExists = Jobs.findOne({ type: 'setSubscriptionCancelledJob', 'data.subscriptionId': subscription._id, status: 'waiting' });

          if (jobExists) {
            Jobs.remove({ _id: jobExists._id });
          }

          return true;

        }

      } else if (when == 'saturday') {
        const jobExists = Jobs.findOne({ type: 'setSubscriptionCancelledJob', 'data.subscriptionId': subscription._id, status: 'waiting' });

        if (jobExists) {
          throw new Meteor.Error('cancel-job-already-present', `This subscription is already scheduled for cancellation on ${moment(jobExists.after).format('YYYY-MM-DD')}`);
        }

        const job = new Job(
          Jobs,
          'setSubscriptionCancelledJob', // type of job
          {
            subscriptionId: subscription._id,
          },
        );

        job.priority('normal').after(saturday).save(); // Commit it to the server

        // job.priority('normal').delay(60 * 500).save(); // Commit it to the server


      }

    }

  },

  activateSubscription(when, customerId, subscriptionAmount) {

    check(when, String);
    check(customerId, String);
    check(subscriptionAmount, Number);

    let saturday = '';

    // if we haven't yet passed the day of the week that I need:
    if (moment().isoWeekday() <= 5) {
      // then just give me this week's instance of that day
      saturday = moment().isoWeekday(5).hour(23).toDate();
    } else {
      // otherwise, give me next week's instance of that day
      saturday = moment().add(1, 'weeks').isoWeekday(5).hour(23).toDate();
    }

    const subscription = Subscriptions.findOne({ customerId });

    if (!subscription) {
      throw new Meteor.Error('500', 'No subscription found.');
    }

    if (subscription && subscription.status === 'active') {
      throw new Meteor.Error('500', 'Subscription is already active.');
    }

    // if (subscription.paymentMethod == 'card') {

    //   if (when == 'immediate') {

    //     const syncCreateSubscriptionFromCustomerProfile = Meteor.wrapAsync(createSubscriptionFromCustomerProfile);

    //     const syncCreateSubscriptionFromCustomerProfileRes = syncCreateSubscriptionFromCustomerProfile(
    //       subscription.authorizeCustomerProfileId,
    //       subscription.authorizePaymentProfileId,
    //       moment(saturday).format('YYYY-MM-DD'),
    //       subscriptionAmount,
    //     );

    //     if (syncCreateSubscriptionFromCustomerProfileRes.messages.resultCode == 'Ok') {

    //       const newAuthSubId = syncCreateSubscriptionFromCustomerProfileRes.subscriptionId;

    //       const statusUpdate = Subscriptions.update({ _id: subscription._id }, { $set: { status: 'paused', authorizeSubscriptionId: newAuthSubId, amount: subscriptionAmount } });


    //       const jobExists = Jobs.findOne({ type: 'setSubscriptionActiveCardJob', 'data.subscriptionId': subscription._id, status: 'waiting' });

    //       if (jobExists) {
    //         Jobs.remove({ _id: jobExists._id });
    //       }

    //       return true;

    //     }

    //     throw new Meteor.Error('500', syncCreateSubscriptionFromCustomerProfileRes.messages.message[0].text);

    //   } else if (when == 'saturday') {

    //     const jobExists = Jobs.findOne({ type: 'setSubscriptionActiveCardJob', 'data.subscriptionId': subscription._id, status: 'waiting' });

    //     if (jobExists) {
    //       throw new Meteor.Error('cancel-job-already-present', `This subscription is already scheduled for activation on ${moment(jobExists.after).format('YYYY-MM-DD')}`);
    //     }

    //     const job = new Job(
    //       Jobs,
    //       'setSubscriptionActiveCardJob', // type of job
    //       {
    //         subscriptionId: subscription._id,
    //         customerId,
    //         subscriptionAmount,
    //         subDate: moment(saturday).format('YYYY-MM-DD'),
    //       },
    //     );

    //     // job.priority('normal').delay(60 * 500).save(); // Commit it to the server

    //     job.priority('normal').after(saturday).save(); // Commit it to the server


    //   }


    // } else if (subscription.paymentMethod == 'cash' || subscription.paymentMethod == 'interac') {
    if (subscription.paymentMethod == 'cash' || subscription.paymentMethod == 'interac' || subscription.paymentMethod == "card") {


      if (when == 'immediate') {

        const statusUpdate = Subscriptions.update({ _id: subscription._id }, { $set: { status: 'active', amount: subscriptionAmount } });

        if (statusUpdate) {
          const jobExists = Jobs.findOne({ type: 'setSubscriptionActiveJob', 'data.subscriptionId': subscription._id, status: 'waiting' });

          if (jobExists) {
            Jobs.remove({ _id: jobExists._id });
          }

          return true;
        }

      } else if (when == 'saturday') {

        const jobExists = Jobs.findOne({ type: 'setSubscriptionActiveJob', 'data.subscriptionId': subscription._id, status: 'waiting' });

        if (jobExists) {
          throw new Meteor.Error('activate-job-already-present', `This subscription is already scheduled for activation on ${moment(jobExists.after).format('YYYY-MM-DD')}`);
        }

        const job = new Job(
          Jobs,
          'setSubscriptionActiveJob', // type of job
          {
            subscriptionId: subscription._id,
            subscriptionAmount,
          },
        );

        job.priority('normal').after(saturday).save(); // Commit it to the server

        // job.priority('normal').delay(60 * 500).save(); // Commit it to the server

      }

    }

  },

  changePaymentMethod(userId, opaqueData, subscriptionAmount, billingInfo) {

    let saturday = '';
    if (moment().isoWeekday() <= 5) {
      saturday = moment().isoWeekday(5).toDate();
    } else {
      saturday = moment().add(1, 'weeks').isoWeekday(6).toDate();
    }

    check(opaqueData, {
      dataDescriptor: String,
      dataValue: String,
    });

    check(subscriptionAmount, Number);
    check(billingInfo, Object);
    check(userId, String);

    const userChange = Meteor.users.findOne({ _id: userId });
    const subscription = Subscriptions.findOne({ customerId: userId });
    // console.log(userChange);

    const syncCreateCustomerProfile = Meteor.wrapAsync(createCustomerProfile);
    // const syncCreateSubscriptionFromCustomerProfile = Meteor.wrapAsync(
    //   createSubscriptionFromCustomerProfile,
    // );

    // create primary profile over on Authorize
    const createCustomerProfileRes = syncCreateCustomerProfile(
      opaqueData.dataDescriptor,
      opaqueData.dataValue,
      {
        email: userChange.emails[0].address,
        id: userChange._id,
        postalCode: billingInfo.billingPostalCode,
        nameOnCard: billingInfo.nameOnCard,
        streetAddress: billingInfo.billingStreetAddress,
      },
    );

    if (
      createCustomerProfileRes.messages.resultCode &&
      createCustomerProfileRes.messages.resultCode != 'Ok'
    ) {
      throw new Meteor.Error(500, 'There was a problem creating user profile.');
    }

    // console.log('Customer');
    // console.log(createCustomerProfileRes);

    // subscription
    // const createSubscriptionFromCustomerProfileRes = syncCreateSubscriptionFromCustomerProfile(
    //   createCustomerProfileRes.customerProfileId,
    //   createCustomerProfileRes.customerPaymentProfileIdList.numericString[0],
    //   moment(saturday).format('YYYY-MM-DD'),
    //   subscriptionAmount,
    // );

    // just use object values below instead of keys..
    const paymentProfileIdObject = createCustomerProfileRes.customerPaymentProfileIdList.numericString[0];
    let paymentProfileIdString = "";
    Object.keys(paymentProfileIdObject).map(e => { paymentProfileIdString += `${paymentProfileIdObject[e]}` })

    // console.log('Subscription data');
    // console.log(createSubscriptionFromCustomerProfileRes);

    // if (
    //   createSubscriptionFromCustomerProfileRes.messages.resultCode &&
    //   createSubscriptionFromCustomerProfileRes.messages.resultCode != 'Ok'
    // ) {
    //   throw new Meteor.Error(
    //     500,
    //     'There was a problem creating subscription from user profile.',
    //   );
    // }

    Subscriptions.update({ customerId: userChange._id },
      {
        $set: {
          amount: subscriptionAmount,
          paymentMethod: 'card',
          status: subscription.status,
          // authorizeSubscriptionId: createSubscriptionFromCustomerProfileRes.subscriptionId,
          authorizeCustomerProfileId: createCustomerProfileRes.customerProfileId,
          authorizePaymentProfileId: paymentProfileIdString,
        },

      },
    );

  },


  changePaymentMethodToExistingCard(subscriptionId) {
    check(subscriptionId, String);

    const subscription = Subscriptions.findOne({_id: subscriptionId});

    if (!subscription) {
        throw new Meteor.Error('500', 'Subscription doesn\'t exist');
    }

    try {
      Subscriptions.update({ _id: subscriptionId },{
          $set: {
            paymentMethod: "card",
          }
      })
    } catch(error) {
        throw new Meteor.Error('500', error.message);

    }
  },

  changePaymentMethodNonCard(type, userId) {

    check(type, String);
    check(userId, String);

    const user = Meteor.users.findOne({ _id: userId });
    const subscription = Subscriptions.findOne({ customerId: user._id });

    if (subscription.paymentMethod == 'card') {

      // const syncCancelSubscription = Meteor.wrapAsync(cancelSubscription);

      // const syncCancelSubscriptionRes = syncCancelSubscription(subscription.authorizeSubscriptionId);

      // if (syncCancelSubscriptionRes.messages.resultCode == 'Ok') {

      const statusUpdate = Subscriptions.update({ _id: subscription._id }, { $set: { paymentMethod: type, status: 'active' } });

      const jobExists = Jobs.findOne({ type: 'setSubscriptionCancelledCardJob', 'data.subscriptionId': subscription._id, status: 'waiting' });

      if (jobExists) {
        Jobs.remove({ _id: jobExists._id });
      }

      // }

      // throw new Meteor.Error('500', syncCancelSubscriptionRes.messages.message[0].text);

    }

    try {
      Subscriptions.update({
        _id: subscription._id,
      }, {
          $set: {
            paymentMethod: type,
          },
        });
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(500, error);
    }


  },

  'users.exportToCSV': function usersExportToCsv(whichStatusesToExport) {
      check(whichStatusesToExport, Match.Any);

      let jsonCustomers = [];

      if (whichStatusesToExport.abandoned || whichStatusesToExport.all) {
            const abandonedUsers = Meteor.users.aggregate([

                { $match: { subscriptionId: { $exists: false }, roles:{ $nin: ['admin', 'super-admin', 'delivery', 'chef'] }} },

                { $project: { 'profile.name.first': 1, 'profile.name.last': 1, 'emails.address': 1,  } },

                {
                    $project: {
                        _id: 0,
                        firstName: '$profile.name.first',
                        lastName: '$profile.name.last',
                        email: '$emails.address',
                    }
                },

                { $unwind: '$email' }
            ]);

          jsonCustomers = jsonCustomers.concat(abandonedUsers);
      }

      if (whichStatusesToExport.active || whichStatusesToExport.paused || whichStatusesToExport.cancelled || whichStatusesToExport.all) {

          const statuses = [];

          if (whichStatusesToExport.active || whichStatusesToExport.all) {
            statuses.push('active');
          }

          if (whichStatusesToExport.paused || whichStatusesToExport.all) {
              statuses.push('paused');
          }

          if (whichStatusesToExport.cancelled || whichStatusesToExport.all) {
              statuses.push('cancelled');
          }

          const otherStatuses = Subscriptions.aggregate([
              {
                  $match: {
                      status: { $in: statuses },
                  },

              },
              {
                  $lookup: {
                      from: 'users',
                      localField: 'customerId',
                      foreignField: '_id',
                      as: 'customer',
                  },
              },
              {
                  $project: {
                      customer: {
                          profile: 1,
                          emails: 1
                      },
                  },

              },
              { $unwind: '$customer' },

              {
                  $project: {
                      _id: 0,
                      firstName: '$customer.profile.name.first',
                      lastName: '$customer.profile.name.last',
                      email: '$customer.emails.address'
                  },

              },

              { $unwind: '$email' },
          ]);


          jsonCustomers = jsonCustomers.concat(otherStatuses);
      }

      return jsonCustomers;
    }
});

rateLimit({
  methods: [
    'users.sendVerificationEmail',
    'users.editProfile',
    'users.addNewStaff',
    'customers.step1',
    'customers.step5',
  ],
  limit: 5,
  timeRange: 1000,
});
