import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import Subscriptions from '../../Subscriptions/Subscriptions';
import { Match } from 'meteor/check';
import { check } from 'meteor/check';
import { JoinServer } from 'meteor-publish-join';

Meteor.publish('users.editProfile', function usersProfile() {
  return Meteor.users.find(this.userId, {
    fields: {
      emails: 1,
      profile: 1,
      services: 1,
    },
  });
});

Meteor.publish('users.owners', () => Meteor.users.find({ roles: ['owner'] }));

Meteor.publish('users.staff', () => Meteor.users.find({ roles: ['staff'] }));

Meteor.publish('users.customers', (query, selector) => {
  check(query, Match.Maybe(Object));
  check(selector, Match.Maybe(Object));

  return Meteor.users.find({ roles: ['customer'] });
});

Meteor.publish('users.customers.new', function newMethod(selector, options, skip, limit) {
  check(selector, Object);
  check(options, Object);
  check(limit, Number);
  check(skip, Number);

  JoinServer.publish({
    context: this,
    name: 'clientUsers',
    interval: -500,
    doJoin() {

      const usersWithSubs = Meteor.users.aggregate([
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

      return usersWithSubs;
    },
  });

});

Meteor.publish('users.customers.primary', (query, selector) => {
  check(query, Match.Maybe(Object));
  check(selector, Match.Maybe(Object));


  return Meteor.users.find({ roles: ['customer'], primaryAccount: { $exists: false } });
});

Meteor.publish('user.customer.single', (customerId) => {
  check(customerId, String);

  return Meteor.users.find({ _id: customerId, roles: ['customer'] });
});

Meteor.publish('user.secondaryAccounts', (customerId) => {
  check(customerId, String);

  return Meteor.users.find({ primaryAccount: customerId });
});


Meteor.publish('customers-all-count', function customersCount() {
  Counts.publish(
    this,
    'customers-count',
    Meteor.users.find({ roles: ['customer'] }),
  );
});

