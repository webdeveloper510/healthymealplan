/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Deliveries = new Mongo.Collection('Deliveries');

Deliveries.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Deliveries.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Deliveries.schema = new SimpleSchema({

  title: {
    type: String,
    label: 'The title of the delivery Day or Evening.',
  },
  customer: {
    type: Object,
    label: 'Customer details',
    blackbox: true,
  },
  route: {
    type: Object,
    label: 'Route details',
    blackbox: true,
  },
  customerId: {
    type: String,
    label: 'Customer ID of the delivery.',
  },
  subscriptionId: {
    type: String,
    label: 'The subscription id of the delivery.',
  },
  postalCode: {
    type: String,
    label: 'The delivery postal code.',
  },
  routeId: {
    type: String,
    label: 'The delivery route.',
  },
  status: {
    type: String,
    label: 'The status of the delivery.',
  },
  onDate: {
    type: String,
    label: 'Date of the delivery',
  },
  meals: {
    type: Array,
    label: 'Meals per profile',
    blackbox: true,
  },
  'meals.$': {
    type: Object,
    label: 'Meals per profile',
  },
  'meals.$.name': {
    type: String,
    label: 'Name of the profile',
  },
  'meals.$.total': {
    type: Number,
    label: 'Name of the profile',
    optional: true,
  },

  activity: {
    type: Object,
    label: 'All acitivity that happened',
    optional: true,
  },

  'activity.statusFrom': {
    type: String,
  },

  'activity.statusTo': {
    type: String,
  },

  createdAt: {
    type: String,
    label: 'The date this delivery was created.',
    autoValue() {
      if (this.isInsert) return (new Date()).toISOString();
    },
  },
  updatedAt: {
    type: String,
    label: 'The date this delivery was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
    },
  },

});

Deliveries.attachSchema(Deliveries.schema);

export default Deliveries;
