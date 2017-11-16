import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import Lifestyles from '../Lifestyles';

Meteor.publish('lifestyles', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return Lifestyles.find();
});

// Note: IngredientTypes.view is also used when editing an existing document.
Meteor.publish('lifestyles.view', (lifestyleId) => {
  check(lifestyleId, String);

  return Lifestyles.find({ _id: lifestyleId });
});

Meteor.publish('lifestyles-all-count', function categoryCount() {
  Counts.publish(this, 'lifestyles-count', Lifestyles.find());
});

