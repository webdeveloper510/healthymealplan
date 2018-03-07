import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Deliveries from './Deliveries';
import Subscriptions from '../Subscriptions/Subscriptions';

import rateLimit from '../../modules/rate-limit';

import sumBy from 'lodash/sumBy';
import moment from 'moment';

import sendDeliveredEmail from './server/send-delivered-email';
import sendDeliveryDelayedEmail from './server/send-delivery-delayed-email';
import sendNotDeliveredEmail from './server/send-not-delivered-email';

import twilio from 'twilio';
import deliveriesDataMapper from '../../modules/server/deliveriesDataMapper';


Meteor.methods({
  'deliveries.insert': function deliveriesInsert(cat) {
    check(cat, {
      title: String,
      types: Array,
    });

    const existsCategory = Deliveries.findOne({ title: cat.title });

    if (existsCategory) {
      throw new Meteor.Error('500', `${cat.title} is already present`);
    }

    try {
      return Deliveries.insert({ title: cat.title, types: cat.types, owner: this.userId });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

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
    });

    check(statusChange, String);

    // console.log(deliveryId);
    console.log(statusChange);

    const twilioClient = new twilio(Meteor.settings.public.twilioAccountSid, Meteor.settings.private.twilioAuthToken);


    try {
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

      console.log(updated);

      // const delivery = Deliveries.findOne({ _id: delivery._id });
      const deliveryUser = Meteor.users.findOne({ _id: delivery.customerId });

      // console.log(deliveryUser);

      if (updated && statusChange == 'Delivered') {
        sendDeliveredEmail({
          firstName: deliveryUser.profile.name.first,
          email: deliveryUser.emails[0].address,
          totalMeals: sumBy(delivery.meals, 'total'),
          address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
          deliveredAt: moment(new Date()).format('h:mm a'),
        });

        twilioClient.messages.create({
          body: `Your ${sumBy(delivery.meals, 'total')} meals have been delivered to ${deliveryUser.address.streetAddress} at ${moment(new Date()).format('h:mm a')}.`,
          to: `+1${deliveryUser.phone}`,
          from: '+16138006196',
        });
      } else if (updated && statusChange == 'Not delivered') {
        sendNotDeliveredEmail({
          firstName: deliveryUser.profile.name.first,
          email: deliveryUser.emails[0].address,
          totalMeals: sumBy(delivery.meals, 'total'),
          address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
          deliveredAt: moment(new Date()).format('h:mm a'),
        });

        twilioClient.messages.create({
          body: `We attempted to deliver your ${sumBy(delivery.meals, 'total')} meals to ${deliveryUser.address.streetAddress} at ${moment(new Date()).format('h:mm a')}. Please get in touch with us so we can try again.`,
          to: `+1${deliveryUser.phone}`,
          from: '+16138006196',
        });
      } else if (updated && statusChange == 'Delayed') {
        sendDeliveryDelayedEmail({
          firstName: deliveryUser.profile.name.first,
          email: deliveryUser.emails[0].address,
          totalMeals: sumBy(delivery.meals, 'total'),
          address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
          deliveredAt: moment(new Date()).format('h:mm a'),
        });

        twilioClient.messages.create({
          body: `We are currently experiencing delays with our deliveries and expect to deliver your ${sumBy(delivery.meals, 'total')} meals later than expected today. Please get in touch with us if you cannot accept a late delivery.`,
          to: `+1${deliveryUser.phone}`,
          from: '+16138006196',
        });
      }

      return delivery._id;
    } catch (exception) {
      console.log(exception)
      throw new Meteor.Error('500', exception);
    }
  },

  'deliveries.batchUpdate': function deliveriesBatchUpdate(deliveries, statusChange) {
    check(deliveries, Array);
    check(statusChange, String);

    console.log(deliveries);
    console.log(statusChange);

    console.log('Server: deliveries.batchUpdate');

    const twilioClient = new twilio(Meteor.settings.public.twilioAccountSid, Meteor.settings.private.twilioAuthToken);

    try {
      deliveries.forEach(e => {
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
      })



      deliveries.forEach((e) => {
        const delivery = Deliveries.findOne({ _id: e._id });
        const deliveryUser = Meteor.users.findOne({ _id: e.customerId });

        if (statusChange == 'Delivered') {
          sendDeliveredEmail({
            firstName: deliveryUser.profile.name.first,
            email: deliveryUser.emails[0].address,
            totalMeals: sumBy(delivery.meals, 'total'),
            address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
            deliveredAt: moment(new Date()).format('h:mm a'),
          });

          twilioClient.messages.create({
            body: `Your ${sumBy(delivery.meals, 'total')} meals have been delivered to ${deliveryUser.address.streetAddress} at ${moment(new Date()).format('h:mm a')}.`,
            to: `+1${deliveryUser.phone}`,
            from: '+16138006196',
          });
        } else if (statusChange == 'Not delivered') {
          sendNotDeliveredEmail({
            firstName: deliveryUser.profile.name.first,
            email: deliveryUser.emails[0].address,
            totalMeals: sumBy(delivery.meals, 'total'),
            address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
            deliveredAt: moment(new Date()).format('h:mm a'),
          });

          twilioClient.messages.create({
            body: `We attempted to deliver your ${sumBy(delivery.meals, 'total')} meals to ${deliveryUser.address.streetAddress} at ${moment(new Date()).format('h:mm a')}. Please get in touch with us so we can try again.`,
            to: `+1${deliveryUser.phone}`,
            from: '+16138006196',
          });
        } else if (statusChange == 'Delayed') {
          sendDeliveryDelayedEmail({
            firstName: deliveryUser.profile.name.first,
            email: deliveryUser.emails[0].address,
            totalMeals: sumBy(delivery.meals, 'total'),
            address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
            deliveredAt: moment(new Date()).format('h:mm a'),
          });

          twilioClient.messages.create({
            body: `We are currently experiencing delays with our deliveries and expect to deliver your ${sumBy(delivery.meals, 'total')} meals later than expected today. Please get in touch with us if you cannot accept a late delivery.`,
            to: `+1${deliveryUser.phone}`,
            from: '+16138006196',
          });
        }
      });
    } catch (exception) {
      console.log(exception)
      throw new Meteor.Error('500', exception);
    }
  },

  getDeliveryAggregatedData(currentDate) {
    check(currentDate, String);

    const aggregation = Subscriptions.aggregate([
      {
        $match: {
          status: 'active',
          'completeSchedule.6': { $exists: true },
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

    // console.log(aggregation);

    const result = deliveriesDataMapper(aggregation, currentDate);


    return result;
  }, // deliveryAggregation
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
