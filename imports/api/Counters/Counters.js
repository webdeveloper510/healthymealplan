/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';

const Counters = new Mongo.Collection('Counters');

Counters.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Counters.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

export default Counters;
