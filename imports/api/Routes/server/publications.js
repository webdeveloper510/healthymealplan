import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import Routes from '../Routes';

Meteor.publish('routes', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return Routes.find();
});

// Note: routes.view is also used when editing an existing document.
Meteor.publish('routes.view', (routeId) => {
  check(routeId, String);

  return Routes.find({ _id: routeId });
});

Meteor.publish('routes-all-count', function categoryCount() {
  Counts.publish(this, 'routes', Routes.find());
});

