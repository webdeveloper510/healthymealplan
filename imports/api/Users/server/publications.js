import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';


Meteor.publish('users.editProfile', function usersProfile() {
  return Meteor.users.find(this.userId, {
    fields: {
      emails: 1,
      profile: 1,
      services: 1,
    },
  });
});


Meteor.publish('users.team', () => Meteor.users.find({ roles: ['staff'] }));
