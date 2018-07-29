import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { check } from 'meteor/check';
import rateLimit from '../../modules/rate-limit';
import aggregate from 'meteor/sakulstra:aggregate';

import Subscriptions from '../Subscriptions/Subscriptions';
import Lifestyles from '../Lifestyles/Lifestyles';

import platingDataMapper from '../../modules/server/platingDataMapper';

Meteor.methods({
  getPlatingAggregatedData(currentDate) {
    check(currentDate, String);

    const subs = Subscriptions.aggregate([
      {
        $match: {
          status: 'active',
        },
      },

      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'subscriptionId',
          as: 'customers',
        },
      },
      {
        $lookup: {
          from: 'Lifestyles',
          localField: 'customers.lifestyle',
          foreignField: '_id',
          as: 'lifestyles',
        },
      },
      {
        $lookup: {
          from: 'Restrictions',
          localField: 'lifestyles.restrictions',
          foreignField: '_id',
          as: 'lifestyleRestrictions',
        },
      },
      {
        $lookup: {
          from: 'Restrictions',
          localField: 'customers.restrictions',
          foreignField: '_id',
          as: 'restrictions',
        },
      },

      {
        $lookup: {
          from: 'Restrictions',
          localField: 'customers.preferences',
          foreignField: '_id',
          as: 'preferences',
        },
      },
      {
        $project: {
          _id: 1,
          completeSchedule: 1,
          delivery: 1,
          customers: {
            _id: 1,
            profile: {
              name: 1,
              birthday: 1,
            },
            secondary: 1,
            primaryAccount: 1,
            lifestyle: 1,
            restrictions: 1,
            specificRestrictions: 1,
            preferences: 1,
            schedule: 1,
            platingNotes: 1,
          },
          lifestyles: {
            _id: 1,
            title: 1,
            restrictions: 1,
            custom: 1,
            disableRestrictions: 1,
          },
          lifestyleRestrictions: {
            _id: 1,
            title: 1,
            type: 1,
          },
          restrictions: {
            _id: 1,
            title: 1,
            type: 1,
          },
          specificRestrictions: {
            _id: 1,
            title: 1,
          },
          preferences: 1,
        },
      },

    ]);

    const result = platingDataMapper(subs, currentDate);

    return result;
  },
});

rateLimit({
  methods: [
    'getPlatingAggregatedData',
  ],
  limit: 5,
  timeRange: 1000,
});
