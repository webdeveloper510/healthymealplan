import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { check } from 'meteor/check';
import Routes from './Routes';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'routes.insert': function routesInsert(route) {
    check(route, {
      title: String,
    });

    const existsCategory = Routes.findOne({ title: route.title });

    if (existsCategory) {
      throw new Meteor.Error('500', `${route.title} is already present`);
    }

    try {
      return Routes.insert({
        ...route,
      });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },

  'routes.update': function routesUpdate(route) {
    check(route, {
      _id: String,
      title: String,
    });

    try {
      const routeId = route._id;
      Routes.update(routeId, { $set: route });
      return routeId; // Return _id so we can redirect to document after update.
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'routes.remove': function routesRemove(routeId) {
    check(routeId, String);

    try {
      return Routes.remove(routeId);
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'routes.batchRemove': function routesBatchRemove(routeIds) {
    check(routeIds, Array);

    try {
      return Routes.remove({ _id: { $in: routeIds } });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'routes.insert',
    'routes.update',
    'routes.remove',
    'routes.batchRemove',
  ],
  limit: 5,
  timeRange: 1000,
});
