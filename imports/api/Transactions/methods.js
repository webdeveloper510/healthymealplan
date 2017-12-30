import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Transactions from './Transactions';
import rateLimit from '../../modules/rate-limit';
import { getNextSequence } from '../../modules/server/get-next-sequence';

Meteor.methods({
  'transaction.insert': function transactionInsert(sub) {
    check(sub, {
      customerId: String,
    });

    try {
      return Transactions.insert({
        paymentMethod: sub.title,
        types: sub.types,
      });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'transactions.update': function transactionsUpdate(sub) {
    check(sub, {
      _id: String,
      customerId: String,
      types: Array,
    });

    try {
      const subId = sub._id;
      Transactions.update(subId, { $set: sub });
      return subId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'transactions.remove': function transactionsRemove(subId) {
    check(subId, String);

    try {
      return Transactions.remove(subId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'transactions.insert',
    'transactions.update',
    'transactions.remove',
  ],
  limit: 5,
  timeRange: 1000,
});
