import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import Deliveries from './Deliveries';
import Subscriptions from '../Subscriptions/Subscriptions';

import rateLimit from '../../modules/rate-limit';

import sortBy from "lodash/sortBy";
import sumBy from 'lodash/sumBy';
import moment from 'moment';

import sendDeliveredEmail from './server/send-delivered-email';
import sendDeliveryDelayedEmail from './server/send-delivery-delayed-email';
import sendNotDeliveredEmail from './server/send-not-delivered-email';
import sendInTransitEmail from './server/send-in-transit-email';

import twilio from 'twilio';
import deliveriesDataMapper from '../../modules/server/deliveriesDataMapper';

const twilioMagicPhones = {
  unavailable: '+15005550000',
  invalid: '+15005550001',
  valid: '+15005550006',
};

Meteor.methods({

  'deliveries.update': function deliveriesUpdate(delivery, statusChange) {
    check(delivery, Object);
    check(delivery, {
      _id: String,
      customer: Object,
      route: Object,
      customerId: String,
      subscriptionId: String,
      postalCode: String,
      routeId: String,
      title: String,
      status: String,
      meals: Array,
      onDate: String,
      deliveryAssignedTo: String,
    });

    check(statusChange, String);

    // console.log(deliveryId);

    const twilioClient = new twilio(Meteor.settings.public.twilioAccountSid, Meteor.settings.private.twilioAuthToken);

    const updated = Deliveries.update(
      {
        routeId: delivery.routeId,
        customerId: delivery.customerId,
        subscriptionId: delivery.subscriptionId,
        onDate: delivery.onDate,
      },
      {
        $set: { status: statusChange, updatedAt: new Date().toISOString() },
        $setOnInsert: {
          _id: delivery._id,
          customer: delivery.customer,
          route: delivery.route,
          customerId: delivery.customerId,
          subscriptionId: delivery.subscriptionId,
          postalCode: delivery.postalCode,
          routeId: delivery.routeId,
          title: delivery.title,
          meals: delivery.meals,
          onDate: delivery.onDate,
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );

    // const delivery = Deliveries.findOne({ _id: delivery._id });
    const deliveryUser = Meteor.users.findOne({ _id: delivery.customerId }, { fields: { _id: 1, address: 1, phone: 1, emails: 1, profile: 1, notifications: 1 } });

    const notifyUserByEmail = deliveryUser.notifications && deliveryUser.notifications.delivery ? deliveryUser.notifications.delivery.email : false;
    const notifyUserBySms = deliveryUser.notifications && deliveryUser.notifications.delivery ? deliveryUser.notifications.delivery.sms : false;
    // const fromPhoneNumber = process.env.NODE_ENV == "development" ? twilioMagicPhones['invalid'] : '+16138006196';
    const fromPhoneNumber = '+16138006196';

    if (updated && statusChange == 'Delivered') {
      let deliveryDriver = null;

      if (notifyUserByEmail || notifyUserBySms) {
        deliveryDriver = Meteor.users.findOne({ _id: this.userId }, { fields: { _id: 1, roles: 1, profile: 1 } });

        if (deliveryDriver.roles.findIndex(e => e == 'delivery') == -1) {
          deliveryDriver = 'Your delivery driver';
        } else {
          deliveryDriver = deliveryDriver.profile.name.first;
        }
      }

      if (notifyUserByEmail) {
        try {
          sendDeliveredEmail({
            deliveryDriver: deliveryDriver || 'Your delivery driver',
            firstName: deliveryUser.profile.name.first,
            email: deliveryUser.emails[0].address,
            totalMeals: sumBy(delivery.meals, 'total'),
            address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
            deliveredAt: moment(new Date()).format('h:mm a'),
          });
        } catch (error) {
          console.log(error);
        }
      }

      if (notifyUserBySms) {
        try {
          twilioClient.messages.create({
            body: `Your ${sumBy(delivery.meals, 'total')} meals have been delivered to ${deliveryUser.address.streetAddress} at ${moment(new Date()).format('h:mm a')}.`,
            to: `+1${deliveryUser.phone}`,
            from: fromPhoneNumber,
          });
        } catch (error) {
          console.log(error);
        }
      }
    } else if (updated && statusChange == 'Not delivered') {
      if (notifyUserByEmail) {
        try {
          sendNotDeliveredEmail({
            firstName: deliveryUser.profile.name.first,
            email: deliveryUser.emails[0].address,
            totalMeals: sumBy(delivery.meals, 'total'),
            address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
            deliveredAt: moment(new Date()).format('h:mm a'),
          });
        } catch (error) {
          console.log(error);
        }
      }

      if (notifyUserBySms) {
        try {
          twilioClient.messages.create({
            body: `We attempted to deliver your ${sumBy(delivery.meals, 'total')} meals to ${deliveryUser.address.streetAddress} at ${moment(new Date()).format('h:mm a')}. Please get in touch with us by calling (613) 701-6250 to discuss pick up.`,
            to: `+1${deliveryUser.phone}`,
            from: fromPhoneNumber,
          });
        } catch (error) {
          console.log(error);
        }
      }
    } else if (updated && statusChange == 'In-Transit') {
      if (notifyUserByEmail || notifyUserBySms) {
        deliveryDriver = Meteor.users.findOne({ _id: this.userId }, { fields: { _id: 1, roles: 1, profile: 1 } });
        if (deliveryDriver.roles.findIndex(e => e == 'delivery') == -1) {
          deliveryDriver = 'Your delivery driver';
        } else {
          deliveryDriver = deliveryDriver.profile.name.first;
        }
      }

      if (notifyUserByEmail) {
        try {
          sendInTransitEmail({
            deliveryDriver: deliveryDriver || 'Your delivery driver',
            firstName: deliveryUser.profile.name.first,
            email: deliveryUser.emails[0].address,
            totalMeals: sumBy(delivery.meals, 'total'),
            address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
            deliveredAt: moment(new Date()).format('h:mm a'),
          });
        } catch (error) {
          console.log(error);
        }
      }

      if (notifyUserBySms) {
        try {
          twilioClient.messages.create({
            body: `${deliveryDriver} just left the kitchen with your ${sumBy(delivery.meals, 'total')} meals and is on route to ${deliveryUser.address.streetAddress}.`,
            to: `+1${deliveryUser.phone}`,
            from: fromPhoneNumber,
          });
        } catch (error) {
          console.log(error);
        }
      }
    } else if (updated && statusChange == 'Delayed') {
      if (notifyUserByEmail) {
        try {
          sendDeliveryDelayedEmail({
            firstName: deliveryUser.profile.name.first,
            email: deliveryUser.emails[0].address,
            totalMeals: sumBy(delivery.meals, 'total'),
            address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
            deliveredAt: moment(new Date()).format('h:mm a'),
          });
        } catch (error) {
          console.log(error);
        }
      }

      if (notifyUserBySms) {
        try {
          twilioClient.messages.create({
            body: `We are currently experiencing delays with our deliveries and expect to deliver your ${sumBy(delivery.meals, 'total')} meals later than expected today. Please get in touch with us if you cannot accept a late delivery.`,
            to: `+1${deliveryUser.phone}`,
            from: fromPhoneNumber,
          });
        } catch (error) {
          console.log(error);
        }
      }
    }

    return delivery._id;
  },

  'deliveries.batchUpdate': function deliveriesBatchUpdate(deliveries, statusChange) {
    check(deliveries, Array);
    check(statusChange, String);

    console.log('Server: deliveries.batchUpdate');
    // console.log(deliveries);

    const twilioClient = new twilio(Meteor.settings.public.twilioAccountSid, Meteor.settings.private.twilioAuthToken);
    // const fromPhoneNumber = process.env.NODE_ENV == "development" ? twilioMagicPhones['valid'] : '+16138006196';
    const fromPhoneNumber = '+16138006196';

    deliveries.forEach((e) => {
      Deliveries.update(
        {
          routeId: e.routeId,
          customerId: e.customerId,
          subscriptionId: e.subscriptionId,
          onDate: e.onDate,
        },
        {
          $set: { status: statusChange, updatedAt: new Date().toISOString() },
          $setOnInsert: {
            _id: e._id,
            customer: e.customer,
            route: e.route,
            customerId: e.customerId,
            subscriptionId: e.subscriptionId,
            postalCode: e.postalCode,
            routeId: e.routeId,
            title: e.title,
            meals: e.meals,
            onDate: e.onDate,
            createdAt: new Date().toISOString(),
          },
        },
        { upsert: true },
      );
    });

    let deliveryDriver = Meteor.users.findOne({ _id: this.userId }, { fields: { _id: 1, roles: 1, profile: 1 } });
    // console.log(deliveryDriver);

    if (deliveryDriver.roles.findIndex(e => e == 'delivery') == -1) {
      deliveryDriver = 'Your delivery driver';
    } else {
      deliveryDriver = deliveryDriver.profile.name.first;
    }

    deliveries.forEach((e) => {
      const delivery = Deliveries.findOne({ _id: e._id });


      const deliveryUser = Meteor.users.findOne({ _id: e.customerId });

      const notifyUserByEmail = deliveryUser.notifications && deliveryUser.notifications.delivery ? deliveryUser.notifications.delivery.email : false;
      const notifyUserBySms = deliveryUser.notifications && deliveryUser.notifications.delivery ? deliveryUser.notifications.delivery.sms : false;

      if (statusChange == 'Delivered') {
        if (notifyUserByEmail) {
          sendDeliveredEmail({
            firstName: deliveryUser.profile.name.first,
            email: deliveryUser.emails[0].address,
            totalMeals: sumBy(e.meals, 'total'),
            address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
            deliveryDriver,
            deliveredAt: moment(new Date()).format('h:mm a'),
            deliveredNote: e.deliveredNote || false,
          });
        }

        if (notifyUserBySms) {
          twilioClient.messages.create({
            body: `Your ${sumBy(e.meals, 'total')} meals have been delivered by ${deliveryDriver} to ${deliveryUser.address.streetAddress} at ${moment(new Date()).format('h:mm a')}. ${e.deliveredNote || ''}`,
            to: `+1${deliveryUser.phone}`,
            from: fromPhoneNumber,
          });
        }
      } else if (statusChange == 'Not delivered') {
        if (notifyUserByEmail) {
          sendNotDeliveredEmail({
            firstName: deliveryUser.profile.name.first,
            email: deliveryUser.emails[0].address,
            totalMeals: sumBy(e.meals, 'total'),
            address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
            deliveredAt: moment(new Date()).format('h:mm a'),
          });
        }

        if (notifyUserBySms) {
          twilioClient.messages.create({
            body: `We attempted to deliver your ${sumBy(e.meals, 'total')} meals to ${deliveryUser.address.streetAddress} at ${moment(new Date()).format('h:mm a')}. Please get in touch with us by calling (613) 701-6250 to discuss pick up.`,
            to: `+1${deliveryUser.phone}`,
            from: fromPhoneNumber,
          });
        }
      } else if (statusChange == 'Delayed') {
        if (notifyUserByEmail) {
          sendDeliveryDelayedEmail({
            firstName: deliveryUser.profile.name.first,
            email: deliveryUser.emails[0].address,
            totalMeals: sumBy(e.meals, 'total'),
            address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
            deliveredAt: moment(new Date()).format('h:mm a'),
          });
        }

        if (notifyUserBySms) {
          twilioClient.messages.create({
            body: `We are currently experiencing delays with our deliveries and expect to deliver your ${sumBy(e.meals, 'total')} meals later than expected today.`,
            to: `+1${deliveryUser.phone}`,
            from: fromPhoneNumber,
          });
        }
      } else if (statusChange == 'In-Transit') {
        if (notifyUserByEmail) {
          try {
            sendInTransitEmail({
              deliveryDriver,
              firstName: deliveryUser.profile.name.first,
              email: deliveryUser.emails[0].address,
              totalMeals: sumBy(e.meals, 'total'),
              address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
              deliveredAt: moment(new Date()).format('h:mm a'),
            });
          } catch (error) {
            console.log(error);
          }
        }

        if (notifyUserBySms) {
          try {
            twilioClient.messages.create({
              body: `${deliveryDriver} just left the kitchen with your ${sumBy(e.meals, 'total')} meals and is on route to ${deliveryUser.address.streetAddress}.`,
              to: `+1${deliveryUser.phone}`,
              from: fromPhoneNumber,
            });
          } catch (error) {
            console.log(error);
          }
        }
      }
    });
  },

  getDeliveriesForTheDay(currentDate, deliveryAssignedToPassed = null) {
    check(currentDate, String);
    check(deliveryAssignedToPassed, Match.OneOf(String, Object));

    const matchObject = {
      status: 'active',
    };

    if (deliveryAssignedToPassed) {
      matchObject.deliveryAssignedTo = deliveryAssignedToPassed;
    }

    const aggregation = Subscriptions.aggregate([
      {
        $match: matchObject,
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
        $lookup: {
          from: 'PostalCodes',
          localField: 'customer.postalCodeId',
          foreignField: '_id',
          as: 'postalCode',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customer._id',
          foreignField: 'primaryAccount',
          as: 'secondaryProfiles',
        },
      },

      {
        $lookup: {
          from: 'Routes',
          localField: 'postalCode.route',
          foreignField: '_id',
          as: 'route',
        },
      },
    ]);

    const result = deliveriesDataMapper(aggregation, currentDate);


    return result;
  }, // deliveryAggregation

  getAssignedUsersAndTheirOrder() {
    const userId = this.userId;

    let assignedUsers = Subscriptions.aggregate([
      {
        $match: {
          deliveryAssignedTo: userId,
            status: 'active',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'subCustomer',
        },
      },
      { $unwind: '$subCustomer' },
      {
        $project: { _id: 1, status: 1, deliveryAssignedTo: 1, subCustomer: { _id: 1, subscriptionId: 1, profile: 1, address: 1, postalCode: 1 } },
      },
    ]);

    const deliveryGuy = Meteor.users.findOne({ _id: this.userId });

    if(assignedUsers.length > 0 && deliveryGuy.hasOwnProperty('assignedUsersOrder')) {
       assignedUsers = sortBy(assignedUsers, user => deliveryGuy.assignedUsersOrder.indexOf(user._id));
    }

    return {
      assignedUsers,
      assignedUsersOrder: deliveryGuy.assignedUsersOrder || [],
    };
  },
  saveCustomerDeliveriesOrder(orderedSubscriptionIds) {

    check(orderedSubscriptionIds, Array);

    try {
      Meteor.users.update({ _id: this.userId }, {
        $set: {
          assignedUsersOrder: orderedSubscriptionIds,
        },
      });
    } catch (exception) {
      throw new Meteor.Error(500, exception.reason || exception);
    }
  },
});

rateLimit({
  methods: [
    'deliveries.insert',
    'deliveries.update',
    'deliveries.batchUpdate',
  ],
  limit: 5,
  timeRange: 1000,
});
