import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { Random } from 'meteor/random';
import moment from 'moment';

import { Accounts } from 'meteor/accounts-base';
import editProfile from './edit-profile';
import rateLimit from '../../../modules/rate-limit';
import createCustomerProfile from '../../../modules/server/authorize/createCustomerProfile';
import createSubscriptionFromCustomerProfile from '../../../modules/server/authorize/createSubscriptionFromCustomerProfile';

import PostalCodes from '../../PostalCodes/PostalCodes';
import Subscriptions from '../../Subscriptions/Subscriptions';
import Jobs from '../../Jobs/Jobs';

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

  'customers.step1': function customerStep1(data) {
    check(data, {
      email: String,
      postalCode: String,
      firstName: String,
      lastName: String,
      phoneNumber: String,
    });

    const postalCodeExists = PostalCodes.find({
      title: data.postalCode.substr(0, 3),
    }).fetch();

    console.log(postalCodeExists);

    let userId;

    try {
      userId = Accounts.createUser({
        email: data.email,
        profile: {
          name: {
            first: data.firstName,
            last: data.lastName,
          },
        },
      });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }

    Roles.addUsersToRoles(userId, ['customer']);

    Meteor.users.update(
      { _id: userId },
      {
        $set: {
          postalCode: data.postalCode,
          postalCodeId: postalCodeExists.length ? postalCodeExists[0]._id : null,
          status: 'abandoned',
          phone: data.phoneNumber,
          adultOrChild: 'adult',
        },
      },
    );

    if (postalCodeExists.length == 0) {
      console.log(postalCodeExists);
      throw new Meteor.Error(400, 'Delivery not available in that area.');
    }

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
          restrictions: customerInfo.primaryProfileBilling.restrictions,
          specificRestrictions:
            customerInfo.primaryProfileBilling.specificRestrictions,
          preferences: customerInfo.primaryProfileBilling.preferences,
          schedule: customerInfo.scheduleReal,

          subscriptionStartDate: customerInfo.subscriptionStartDate,
          subscriptionStartDateRaw: customerInfo.subscriptionStartDateRaw,
          associatedProfiles: customerInfo.secondaryProfileCount,
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
          customerInfo.primaryProfileBilling.dinner.totalQty,

        price:
          customerInfo.primaryProfileBilling.breakfast.totalQty *
          customerInfo.primaryProfileBilling.breakfastPrice +
          customerInfo.primaryProfileBilling.lunch.totalQty *
          customerInfo.primaryProfileBilling.lunchPrice +
          customerInfo.primaryProfileBilling.dinner.totalQty *
          customerInfo.primaryProfileBilling.dinnerPrice,
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
              customerInfo.secondaryProfilesBilling[i].dinner.totalQty,

            price:
              customerInfo.secondaryProfilesBilling[i].breakfast.totalQty *
              customerInfo.secondaryProfilesBilling[i].breakfastPrice +
              customerInfo.secondaryProfilesBilling[i].lunch.totalQty *
              customerInfo.secondaryProfilesBilling[i].lunchPrice +
              customerInfo.secondaryProfilesBilling[i].dinner.totalQty *
              customerInfo.secondaryProfilesBilling[i].dinnerPrice,
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
            (e, i) => {
              primaryProfileLineItems.restrictions.push({
                title: e.title,
                extra: e.extra,
                type: e.discountOrExtraType,
                surcharge:
                  customerInfo.secondaryProfilesBilling[i]
                    .restrictionsSurcharges[i],
              });
            },
          );
        }

        subscriptionItemsReal.push(currentProfileLineItems);
      });
    }
    console.log(subscriptionItemsReal);

    const newDeliveryType = customerInfo.deliveryType.map((e, i) => {

      if (e == '') {
        return customerInfo.deliveryType[i] == null;
      }

      return e;


    });


    console.log(newDeliveryType);


    const subscriptionId = Subscriptions.insert({
      _id: subscriptionIdToSave,
      customerId: customerInfo.id,
      status: 'paused',
      paymentMethod: customerInfo.paymentMethod,
      amount: actualTotal,
      taxExempt: customerInfo.taxExempt,
      completeSchedule: customerInfo.completeSchedule,
      delivery: newDeliveryType,
      subscriptionItems: subscriptionItemsReal,
    });

    console.log(subscriptionId);

    const lastWeeksSaturday = moment(
      customerInfo.subscriptionStartDateRaw,
    ).subtract(2, 'd');

    const job = new Job(
      Jobs,
      'setSubscriptionActive', // type of job
      {
        subscriptionId,
        customerId: customerInfo.id,
      },
    );
    const a = moment(lastWeeksSaturday);
    const b = moment().startOf('day');
    a.diff(b);

    console.log(a.diff(b));

    job
      .priority('normal')
      .delay(Math.abs(a.diff(b))) // Wait an hour before first try
      .save(); // Commit it to the server
  },

  'customers.step5': function customerStep5(opaqueData, customerInfo) {
    check(opaqueData, {
      dataDescriptor: String,
      dataValue: String,
    });

    const subscriptionIdToSave = Random.id();

    check(customerInfo, Object);

    console.log(customerInfo);


    const syncCreateCustomerProfile = Meteor.wrapAsync(createCustomerProfile);
    const syncCreateSubscriptionFromCustomerProfile = Meteor.wrapAsync(
      createSubscriptionFromCustomerProfile,
    );

    // create primary profile over on Authorize
    const createCustomerProfileRes = syncCreateCustomerProfile(
      opaqueData.dataDescriptor,
      opaqueData.dataValue,
      {
        email: customerInfo.email,
        id: customerInfo.id,
        postalCode: customerInfo.billingPostalCode,
        nameOnCard: customerInfo.nameOnCard,
      },
    );

    if (
      createCustomerProfileRes.resultCode &&
      createCustomerProfileRes.resultCode != 'Ok'
    ) {
      throw new Meteor.Error(500, 'There was a problem creating user profile.');
    }

    console.log('Customer');
    console.log(createCustomerProfileRes);

    // primary profile created successfully on authorize

    // start adding plan data to primary profile and each of the secondary profile(s)
    Meteor.users.update(
      { _id: customerInfo.id },
      {
        $set: {
          subscriptionId: subscriptionIdToSave,
          address: customerInfo.address,
          lifestyle: customerInfo.primaryProfileBilling.lifestyle._id,
          restrictions: customerInfo.primaryProfileBilling.restrictions,
          specificRestrictions:
            customerInfo.primaryProfileBilling.specificRestrictions,
          preferences: customerInfo.primaryProfileBilling.preferences,
          schedule: customerInfo.scheduleReal,

          subscriptionStartDate: customerInfo.subscriptionStartDate,
          subscriptionStartDateRaw: customerInfo.subscriptionStartDateRaw,
          associatedProfiles: customerInfo.secondaryProfileCount,
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

    // totaling
    let actualTotal = customerInfo.primaryProfileBilling.groupTotal;

    if (customerInfo.taxExempt) {
      actualTotal =
        customerInfo.primaryProfileBilling.groupTotal -
        customerInfo.primaryProfileBilling.taxes;
    }

    actualTotal = parseFloat(actualTotal.toFixed(2));

    // subscriptionDate (Previous saturday)
    const lastWeeksSaturday = moment(
      customerInfo.subscriptionStartDateRaw,
    ).subtract(2, 'd');

    // subscription
    const createSubscriptionFromCustomerProfileRes = syncCreateSubscriptionFromCustomerProfile(
      createCustomerProfileRes.customerProfileId,
      createCustomerProfileRes.customerPaymentProfileIdList.numericString[0],
      moment(lastWeeksSaturday).format('YYYY-MM-DD'),
      actualTotal,
    );

    console.log('Subscription data');
    console.log(createSubscriptionFromCustomerProfileRes);

    if (
      createSubscriptionFromCustomerProfileRes.resultCode &&
      createSubscriptionFromCustomerProfileRes.resultCode != 'Ok'
    ) {
      throw new Meteor.Error(
        500,
        'There was a problem creating subscription from user profile.',
      );
    }

    console.log('create customer profile res');

    console.log(createCustomerProfileRes);

    console.log('create subscription from profile res');

    console.log(createSubscriptionFromCustomerProfileRes);

    const subscriptionItemsReal = [];

    const primaryProfileLineItems = {
      lifestyle: {
        title: customerInfo.primaryProfileBilling.lifestyle.title,
        meals:
          customerInfo.primaryProfileBilling.breakfast.totalQty +
          customerInfo.primaryProfileBilling.lunch.totalQty +
          customerInfo.primaryProfileBilling.dinner.totalQty,

        price:
          customerInfo.primaryProfileBilling.breakfast.totalQty *
          customerInfo.primaryProfileBilling.breakfastPrice +
          customerInfo.primaryProfileBilling.lunch.totalQty *
          customerInfo.primaryProfileBilling.lunchPrice +
          customerInfo.primaryProfileBilling.dinner.totalQty *
          customerInfo.primaryProfileBilling.dinnerPrice,
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
              customerInfo.secondaryProfilesBilling[i].dinner.totalQty,

            price:
              customerInfo.secondaryProfilesBilling[i].breakfast.totalQty *
              customerInfo.secondaryProfilesBilling[i].breakfastPrice +
              customerInfo.secondaryProfilesBilling[i].lunch.totalQty *
              customerInfo.secondaryProfilesBilling[i].lunchPrice +
              customerInfo.secondaryProfilesBilling[i].dinner.totalQty *
              customerInfo.secondaryProfilesBilling[i].dinnerPrice,
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
            (e, i) => {
              primaryProfileLineItems.restrictions.push({
                title: e.title,
                extra: e.extra,
                type: e.discountOrExtraType,
                surcharge:
                  customerInfo.secondaryProfilesBilling[i]
                    .restrictionsSurcharges[i],
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

    const subscriptionId = Subscriptions.insert({
      _id: subscriptionIdToSave,
      customerId: customerInfo.id,
      authorizeSubscriptionId:
        createSubscriptionFromCustomerProfileRes.subscriptionId,
      authorizeCustomerProfileId:
        createSubscriptionFromCustomerProfileRes.profile.customerProfileId,
      authorizePaymentProfileId:
        createSubscriptionFromCustomerProfileRes.profile
          .customerPaymentProfileId,

      status: 'paused',
      paymentMethod: customerInfo.paymentMethod,
      amount: actualTotal,
      taxExempt: customerInfo.taxExempt,
      completeSchedule: customerInfo.completeSchedule,
      delivery: newDeliveryType,
      subscriptionItems: subscriptionItemsReal,
    });

    return createSubscriptionFromCustomerProfileRes;
  },
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
