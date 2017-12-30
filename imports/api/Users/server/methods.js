import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';

import { Accounts } from 'meteor/accounts-base';
import editProfile from './edit-profile';
import rateLimit from '../../../modules/rate-limit';
import createCustomerProfile from '../../../modules/server/authorize/createCustomerProfile';
import createSubscriptionFromCustomerProfile from '../../../modules/server/authorize/createSubscriptionFromCustomerProfile';

import Routes from '../../Routes/Routes';
import Subscriptions from '../../Subscriptions/Subscriptions';

Meteor.methods({
  'users.sendVerificationEmail': function usersSendVerificationEmail() {
    return Accounts.sendVerificationEmail(this.userId);
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

    const postalCodeExists = Routes.find({
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

  'customer.step5.noCreditCard': function (customerInfo) {
    check(customerInfo, Object);

    console.log(customerInfo);

    Meteor.users.update(
      { _id: customerInfo.id },
      {
        $set: {
          address: customerInfo.address,
          lifestyle: customerInfo.primaryProfileBilling.lifestyle._id,
          restrictions: customerInfo.primaryProfileBilling.restrictions,
          specificRestrictions:
            customerInfo.primaryProfileBilling.specificRestrictions,
          preferences: customerInfo.primaryProfileBilling.preferences,
          schedule: customerInfo.primaryProfileBilling.scheduleReal,
        },
      },
    );

    Subscriptions.insert({});
  },

  'customers.step5': function customerStep5(opaqueData) {
    check(opaqueData, {
      dataDescriptor: String,
      dataValue: String,
    });

    // const future = new Future();

    const syncCreateCustomerProfile = Meteor.wrapAsync(createCustomerProfile);
    const syncCreateSubscriptionFromCustomerProfile = Meteor.wrapAsync(
      createSubscriptionFromCustomerProfile,
    );

    const createCustomerProfileRes = syncCreateCustomerProfile(
      opaqueData.dataDescriptor,
      opaqueData.dataValue,
    );

    if (
      createCustomerProfileRes.resultCode &&
      createCustomerProfileRes.resultCode != 'Ok'
    ) {
      throw new Meteor.Error(500, 'There was a problem creating user profile.');
    }

    const createSubscriptionFromCustomerProfileRes = syncCreateSubscriptionFromCustomerProfile(
      createCustomerProfileRes.customerProfileId,
      createCustomerProfileRes.customerPaymentProfileIdList.numericString[0],
      '2017-12-29', // calculate this from the subscriptionStartDate step data
      100, // calculate this from user plan selection, restrictions and delivery pricing
    );

    if (
      createSubscriptionFromCustomerProfileRes.resultCode &&
      createSubscriptionFromCustomerProfileRes.resultCode != 'Ok'
    ) {
      throw new Meteor.Error(
        500,
        'There was a problem creating subscription from user profile.',
      );
    }

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
