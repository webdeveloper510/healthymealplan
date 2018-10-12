import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Match } from 'meteor/check';
import GiftCards from '../GiftCards';

Meteor.publish('giftcards', (selector, options) => {
  check(selector, Match.Any);
  check(options, Match.Any);

  return GiftCards.find();
});

// Note: IngredientTypes.view is also used when editing an existing document.
Meteor.publish('giftcards.view', (categoryId) => {
  check(categoryId, String);

  return GiftCards.find({ _id: categoryId });
});

Meteor.publish('giftcards-all-count', function categoryCount() {
  Counts.publish(this, 'giftcards-count', GiftCards.find());
});

