import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Deliveries from './Deliveries';
import rateLimit from '../../modules/rate-limit';

import sumBy from 'lodash/sumBy';
import moment from 'moment';

import sendDeliveredEmail from './server/send-delivered-email';
import sendDeliveryDelayedEmail from './server/send-delivery-delayed-email';
import sendNotDeliveredEmail from './server/send-not-delivered-email';

import twilio from 'twilio';



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

  'deliveries.update': function deliveriesUpdate(deliveryId, statusChange) {
    check(deliveryId, String);
    check(statusChange, String);

    console.log(deliveryId);
    console.log(statusChange);

    let twilioClient = new twilio(Meteor.settings.public.twilioAccountSid, Meteor.settings.private.twilioAuthToken);


    try {
      const updated = Deliveries.update({ _id: deliveryId }, { $set: { status: statusChange } });

      const delivery = Deliveries.findOne({ _id: deliveryId });
      const deliveryUser = Meteor.users.findOne({ _id: delivery.customerId });

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
          from: '+16138006196'
        });

      } else if (updated && statusChange == 'Not delivered') {

        sendNotDeliveredEmail({
          firstName: deliveryUser.profile.name.first,
          email: deliveryUser.emails[0].address,
          email: 'jivanyesh@gmail.com',
          totalMeals: sumBy(delivery.meals, 'total'),
          address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
          deliveredAt: moment(new Date()).format('h:mm a'),
        });

        twilioClient.messages.create({
          body: `We attempted to deliver your ${sumBy(delivery.meals, 'total')} meals to ${deliveryUser.address.streetAddress} at ${moment(new Date()).format('h:mm a')}. Please get in touch with us so we can try again.`,
          to: `+1${deliveryUser.phone}`,
          from: '+16138006196'
        });

      } else if (updated && statusChange == 'Delayed') {

        sendDeliveryDelayedEmail({
          firstName: deliveryUser.profile.name.first,
          email: deliveryUser.emails[0].address,
          email: 'jivanyesh@gmail.com',
          totalMeals: sumBy(delivery.meals, 'total'),
          address: `${deliveryUser.address.streetAddress} ${deliveryUser.address.postalCode}`,
          deliveredAt: moment(new Date()).format('h:mm a'),
        });

        twilioClient.messages.create({
          body: `We are currently experiencing delays with our deliveries and expect to deliver your ${sumBy(delivery.meals, 'total')} meals later than expected today. Please get in touch with us if you cannot accept a late delivery.`,
          to: `+1${deliveryUser.phone}`,
          from: '+16138006196'
        });

      }

      return deliveryId;
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'deliveries.batchUpdate': function deliveriesBatchUpdate(deliveryIds, statusChange) {
    check(deliveryIds, Array);
    check(statusChange, String);

    console.log(deliveryIds);
    console.log(statusChange);

    console.log('Server: deliveries.batchUpdate');

    try {
      const batchUpdate = Deliveries.update({ _id: { $in: deliveryIds } }, { $set: { status: statusChange } }, { multi: true });

      if (!batchUpdate) {
        return false;
      }

      deliveryIds.forEach((deliveryId) => {
        const delivery = Deliveries.findOne({ _id: deliveryId });
        const deliveryUser = Meteor.users.findOne({ _id: delivery.customerId });

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
            from: '+16138006196'
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
            from: '+16138006196'
          })

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
            from: '+16138006196'
          });


        }
      });

    } catch (exception) {
      throw new Meteor.Error('500', exception);
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
