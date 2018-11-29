import { Meteor } from 'meteor/meteor';
import createIndex from '../../../modules/server/create-index';

createIndex(Meteor.users, { 'profile.name': 1, lifestyle: 1, });
