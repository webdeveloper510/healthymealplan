import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Deliveries from './Deliveries';
import rateLimit from '../../modules/rate-limit';

import sumBy from 'lodash/sumBy';
import moment from 'moment';

import sendDeliveredEmail from '../Deliveries/server/send-delivered-email';

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




    try {
      const updated = Deliveries.update({ _id: deliveryId }, { $set: { status: statusChange } });

      if (updated && statusChange == "Delivered") {

        let delivery = Deliveries.findOne({ _id: deliveryId });
        let deliveryUser = Meteor.users.findOne({ _id: delivery.customerId });

        console.log(deliveryUser);

        sendDeliveredEmail({
          firstName: deliveryUser.profile.name.first,
          // email: deliveryUser.emails[0].address,
          email: 'jivanyesh@gmail.com',
          totalMeals: sumBy(delivery.meals, 'total'),
          address: deliveryUser.address.streetAddress + deliveryUser.address.postalCode,
          deliveredAt: moment(new Date()).format('h:mm a'),
        });

      } else if (updated && statusChange == "Not delivered") {

        // let delivery = Deliveries.findOne({ _id: deliveryId });
        // let deliveryUser = Meteor.users.findOne({ _id: delivery.customerId });

        // console.log(deliveryUser);

        // sendDeliveredEmail({
        //   firstName: deliveryUser.profile.name.first,
        //   email: deliveryUser.emails[0].address,
        //   totalMeals: sumBy(delivery.meals, 'total'),
        //   address: deliveryUser.streetAddress + deliveryUser.postalCode,
        //   deliveredAt: moment(new Date()).format('h:mm a'),
        // });

      } else if (updated && statusChange == "Delayed") {

        // let delivery = Deliveries.findOne({ _id: deliveryId });
        // let deliveryUser = Meteor.users.findOne({ _id: delivery.customerId });

        // console.log(deliveryUser);

        // sendDeliveredEmail({
        //   firstName: deliveryUser.profile.name.first,
        //   email: deliveryUser.emails[0].address,
        //   totalMeals: sumBy(delivery.meals, 'total'),
        //   address: deliveryUser.streetAddress + deliveryUser.postalCode,
        //   deliveredAt: moment(new Date()).format('h:mm a'),
        // });

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
      return Deliveries.update({ _id: { $in: deliveryIds } }, { $set: { status: statusChange } }, { multi: true });
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
