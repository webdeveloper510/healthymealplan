import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { Match } from 'meteor/check';
import { check } from 'meteor/check';

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

  // query.roles = ['customer'];
  // selector.fields = {
  //   emails: 1,
  //   profile: 1,
  //   services: 1,
  // }

  return Meteor.users.find({ roles: ['customer'] });
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
